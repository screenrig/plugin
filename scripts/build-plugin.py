#!/usr/bin/env python3
"""Build the committed ScreenRig Codex and Claude plugin from canonical sources."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
import filecmp
import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
CLI = ROOT / "packages" / "cli"
SKILL = ROOT / "skills" / "screenrig"
PUBLIC_ROOT = ROOT / "build" / "plugin"
PLUGINS = ROOT / "plugins"
PLUGIN_NAME = "screenrig"
PUBLIC_FILES = (
    ".github/workflows/ci.yml",
    ".gitleaks.toml",
    "LICENSE",
    "README.md",
    "SECURITY.md",
    "scripts/check-public-repo.py",
)


class BuildError(RuntimeError):
    pass


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BuildError(f"{path.relative_to(ROOT)}: {exc}") from exc
    if not isinstance(value, dict):
        raise BuildError(f"{path.relative_to(ROOT)}: expected a JSON object")
    return value


def version() -> str:
    marketplace = load_json(ROOT / ".claude-plugin" / "marketplace.json")
    entries = marketplace.get("plugins") or []
    if len(entries) != 1 or not isinstance(entries[0], dict):
        raise BuildError(".claude-plugin/marketplace.json must contain one plugin")
    value = entries[0].get("version")
    if not isinstance(value, str) or not value:
        raise BuildError(".claude-plugin/marketplace.json plugin version is missing")
    return value


def npm_package_files(cli_root: Path, *, build_source: bool) -> list[str]:
    if not build_source:
        paths = sorted(path.relative_to(cli_root).as_posix() for path in cli_root.rglob("*") if path.is_file())
        if "dist/bin.js" not in paths or "package.json" not in paths:
            raise BuildError("pinned CLI artifact is missing dist/bin.js or package.json")
        return paths
    if not (cli_root / "package.json").is_file():
        raise BuildError("pinned CLI release input is missing at packages/cli/package.json")
    npm_env = dict(os.environ)
    npm_env["NPM_CONFIG_CACHE"] = str(cli_root / ".tmp" / "npm-cache")
    build = subprocess.run(
        ["npm", "run", "build"],
        cwd=cli_root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=npm_env,
        check=False,
    )
    if build.returncode != 0:
        raise BuildError(f"CLI build failed:\n{build.stdout}{build.stderr}")
    packed = subprocess.run(
        ["npm", "pack", "--json", "--dry-run"],
        cwd=cli_root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=npm_env,
        check=False,
    )
    if packed.returncode != 0:
        raise BuildError(f"CLI package inventory failed:\n{packed.stdout}{packed.stderr}")
    try:
        payload = json.loads(packed.stdout)
        if isinstance(payload, list):
            package = payload[0]
        elif isinstance(payload, dict) and isinstance(payload.get(PLUGIN_NAME), dict):
            package = payload[PLUGIN_NAME]
        else:
            raise TypeError("unknown npm pack JSON shape")
        files = package["files"]
        paths = [str(entry["path"]) for entry in files]
    except (json.JSONDecodeError, KeyError, IndexError, TypeError) as exc:
        raise BuildError("npm pack returned an invalid file inventory") from exc
    if "dist/bin.js" not in paths or "package.json" not in paths:
        raise BuildError("CLI package inventory is missing dist/bin.js or package.json")
    return paths


def verify_cli_artifact(artifact: Path) -> None:
    lock = load_json(ROOT / "components.lock.json")
    cli = lock.get("cli")
    if lock.get("schema") != "screenrig.plugin-components-lock/v1" or lock.get("state") != "resolved" or not isinstance(cli, dict):
        raise BuildError("standalone plugin component lock is unresolved or invalid")
    repository = cli.get("repository")
    commit = cli.get("commit")
    pinned = cli.get("artifact")
    if not isinstance(repository, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise BuildError("standalone plugin CLI repository is invalid")
    if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit) or set(commit) == {"0"}:
        raise BuildError("standalone plugin CLI commit is invalid")
    if not isinstance(pinned, dict) or pinned.get("file") != artifact.name:
        raise BuildError("standalone plugin CLI artifact filename differs from the component lock")
    digest = hashlib.sha256(artifact.read_bytes()).hexdigest()
    if pinned.get("sha256") != digest:
        raise BuildError("standalone plugin CLI artifact digest differs from the component lock")


def extract_cli_artifact(artifact: Path, destination: Path) -> Path:
    seen: set[str] = set()
    with tarfile.open(artifact, "r:gz") as archive:
        for member in archive.getmembers():
            parts = Path(member.name).parts
            if not parts or parts[0] != "package" or any(part in {"", ".", ".."} for part in parts):
                raise BuildError(f"pinned CLI artifact contains an unsafe path: {member.name}")
            relative = Path(*parts[1:])
            if not relative.parts:
                if not member.isdir():
                    raise BuildError("pinned CLI artifact has an invalid package root")
                continue
            canonical = relative.as_posix()
            if canonical in seen:
                raise BuildError(f"pinned CLI artifact contains a duplicate path: {canonical}")
            seen.add(canonical)
            target = destination / relative
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            elif member.isfile():
                source = archive.extractfile(member)
                if source is None:
                    raise BuildError(f"pinned CLI artifact entry is unreadable: {canonical}")
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open("xb") as output:
                    shutil.copyfileobj(source, output)
            else:
                raise BuildError(f"pinned CLI artifact contains a non-regular entry: {canonical}")
    return destination


@contextmanager
def cli_input(cli_artifact: Path | None):
    if cli_artifact is None:
        if not CLI.is_dir():
            raise BuildError("standalone plugin rebuild requires --cli-artifact")
        yield CLI, True
        return
    verify_cli_artifact(cli_artifact)
    with tempfile.TemporaryDirectory(prefix="screenrig-plugin-cli-") as temporary:
        yield extract_cli_artifact(cli_artifact, Path(temporary) / "package"), False


def emit_manifests(plugin_root: Path, metadata: dict[str, Any], release_version: str) -> None:
    base = {
        "name": PLUGIN_NAME,
        "version": release_version,
        "description": metadata["description"],
        "author": metadata["author"],
        "homepage": metadata["homepage"],
        "repository": metadata["repository"],
        "license": metadata["license"],
        "keywords": metadata["keywords"],
    }
    claude = dict(base)
    codex = dict(base)
    codex["skills"] = "./skills/"
    codex["interface"] = {
        **metadata["interface"],
        "developerName": "ScreenRig",
        "category": "Developer Tools",
        "capabilities": ["Interactive", "Read", "Write"],
        "websiteURL": metadata["homepage"],
        "brandColor": "#111827",
    }
    for platform, manifest in (("claude", claude), ("codex", codex)):
        destination = plugin_root / f".{platform}-plugin" / "plugin.json"
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def build(output: Path, cli_artifact: Path | None = None) -> Path:
    metadata = load_json(ROOT / "build" / "plugin.json")
    if metadata.get("name") != PLUGIN_NAME:
        raise BuildError("build/plugin.json name must be screenrig")
    release_version = version()
    plugin_root = output / PLUGIN_NAME
    public_root = PUBLIC_ROOT if PUBLIC_ROOT.is_dir() else ROOT
    plugin_root.mkdir(parents=True, exist_ok=True)
    for relative in PUBLIC_FILES:
        source = public_root / relative
        if not source.is_file():
            raise BuildError(f"public plugin root file is missing: {relative}")
        destination = plugin_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    shutil.copytree(SKILL, plugin_root / "skills" / PLUGIN_NAME)

    cli_root = plugin_root / "cli"
    with cli_input(cli_artifact) as (source_root, build_source):
        for relative in npm_package_files(source_root, build_source=build_source):
            source = source_root / relative
            destination = cli_root / relative
            if not source.is_file():
                raise BuildError(f"npm package file is missing: {relative}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
    (cli_root / "dist" / "bin.js").chmod(0o755)
    emit_manifests(plugin_root, metadata, release_version)
    return plugin_root


def file_mode(path: Path) -> int:
    return stat.S_IMODE(path.stat().st_mode)


def compare(expected: Path, actual: Path) -> list[str]:
    expected_files = {path.relative_to(expected) for path in expected.rglob("*") if path.is_file()}
    actual_files = {path.relative_to(actual) for path in actual.rglob("*") if path.is_file()} if actual.exists() else set()
    changes: list[str] = []
    changes.extend(f"missing {path}" for path in sorted(expected_files - actual_files))
    changes.extend(f"extra {path}" for path in sorted(actual_files - expected_files))
    for relative in sorted(expected_files & actual_files):
        if not filecmp.cmp(expected / relative, actual / relative, shallow=False):
            changes.append(f"changed {relative}")
        elif file_mode(expected / relative) != file_mode(actual / relative):
            changes.append(f"mode {relative}")
    return changes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--cli-artifact", type=Path)
    args = parser.parse_args()
    try:
        if args.check:
            with tempfile.TemporaryDirectory(prefix="screenrig-plugin-") as temp:
                expected = Path(temp) / "plugins"
                build(expected, args.cli_artifact)
                changes = compare(expected / PLUGIN_NAME, PLUGINS / PLUGIN_NAME)
                if changes:
                    print("generated ScreenRig plugin is stale:", file=sys.stderr)
                    for change in changes:
                        print(f"  {change}", file=sys.stderr)
                    return 1
                print("generated ScreenRig plugin is current")
                return 0
        target = PLUGINS / PLUGIN_NAME
        if target.exists():
            shutil.rmtree(target)
        build(PLUGINS, args.cli_artifact)
        print("built ScreenRig plugin")
        return 0
    except BuildError as exc:
        print(f"build-plugin: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
