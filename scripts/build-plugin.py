#!/usr/bin/env python3
"""Build the committed ScreenRig Codex and Claude plugin from canonical sources.

Pack sibling ``../cli`` or a ``--cli-artifact`` from current ``screenrig/cli``
``main``. ``components.lock.json`` is provenance of the tarball just packed
(filename, SHA-256, and the commit that produced those bytes). It is not a
freeze of which SHA to fetch. Do not refetch a commit from that file.
"""

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
from pathlib import Path, PurePosixPath
from typing import Any, Iterator


ROOT = Path(__file__).resolve().parent.parent
SIBLING_CLI = ROOT.parent / "cli"
SKILL = ROOT / "skills" / "screenrig"
PUBLIC_ROOT = ROOT / "build" / "plugin"
PLUGINS = ROOT / "plugins"
PLUGIN_NAME = "screenrig"
CLI_REPOSITORY = "screenrig/cli"
CLI_ARTIFACT_NAME = "screenrig-cli.tgz"
# Provenance of the tarball just packed. Never a fetch pin.
LOCK_PATH = ROOT / "components.lock.json"
LOCK_SCHEMA = "screenrig.plugin-components-lock/v1"
CLI_RUNTIME_LOCK = "runtime-dependencies.lock.json"
PUBLIC_FILES = (
    ".github/workflows/ci.yml",
    ".gitleaks.toml",
    "LICENSE",
    "README.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "scripts/check-public-repo.py",
)


class BuildError(RuntimeError):
    pass


def run_command(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> None:
    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        check=False,
    )
    if result.returncode != 0:
        raise BuildError(f"{' '.join(command)} failed:\n{result.stdout}{result.stderr}")


def sibling_cli_root() -> Path | None:
    if (SIBLING_CLI / "scripts" / "package-release.sh").is_file() and (SIBLING_CLI / "package.json").is_file():
        return SIBLING_CLI
    return None


def git_head(repo: Path) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), "rev-parse", "HEAD"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    commit = result.stdout.strip()
    if result.returncode != 0 or not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise BuildError(f"cannot read CLI commit from {repo}")
    return commit


def pack_cli_source(source: Path, destination: Path) -> None:
    script = source / "scripts" / "package-release.sh"
    if not script.is_file():
        raise BuildError(f"CLI source is missing scripts/package-release.sh: {source}")
    env = dict(os.environ)
    env["NPM_CONFIG_CACHE"] = str(source / ".tmp" / "npm-cache")
    if not (source / "node_modules").is_dir():
        run_command(["npm", "ci"], source, env)
    run_command(["npm", "run", "build"], source, env)
    destination.parent.mkdir(parents=True, exist_ok=True)
    run_command(["bash", str(script), str(destination)], source, env)
    if not destination.is_file():
        raise BuildError(f"CLI packer did not write {destination}")


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_component_lock(commit: str, artifact: Path) -> None:
    """Record provenance of ``artifact``. ``commit`` is the SHA that produced it."""
    if not re.fullmatch(r"[0-9a-f]{40}", commit) or set(commit) == {"0"}:
        raise BuildError("CLI commit is invalid")
    payload = {
        "schema": LOCK_SCHEMA,
        "state": "resolved",
        "cli": {
            "repository": CLI_REPOSITORY,
            "commit": commit,
            "artifact": {
                "file": artifact.name,
                "sha256": sha256_file(artifact),
            },
        },
    }
    LOCK_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def verify_cli_runtime_bundle(cli_root: Path) -> None:
    runtime_lock = cli_root / CLI_RUNTIME_LOCK
    try:
        manifest = json.loads(runtime_lock.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BuildError(f"bundled CLI artifact is missing a valid {CLI_RUNTIME_LOCK}") from exc
    if not isinstance(manifest, dict):
        raise BuildError(f"bundled CLI artifact has an invalid {CLI_RUNTIME_LOCK}")
    packages = manifest.get("packages")
    if manifest.get("schema") != "screenrig.cli-runtime-dependencies/v1" or not isinstance(packages, list) or not packages:
        raise BuildError(f"bundled CLI artifact has an invalid {CLI_RUNTIME_LOCK}")
    package_lock_sha256 = manifest.get("package_lock_sha256")
    if not isinstance(package_lock_sha256, str) or re.fullmatch(r"[0-9a-f]{64}", package_lock_sha256) is None:
        raise BuildError(f"bundled CLI artifact has an invalid {CLI_RUNTIME_LOCK} package-lock digest")
    bundled_names: set[str] = set()
    bundled_paths: set[str] = set()
    for package in packages:
        if not isinstance(package, dict):
            raise BuildError(f"bundled CLI artifact has an invalid {CLI_RUNTIME_LOCK} package entry")
        relative = package.get("path")
        name = package.get("name")
        version_value = package.get("version")
        resolved = package.get("resolved")
        integrity = package.get("integrity")
        posix_path = PurePosixPath(relative) if isinstance(relative, str) else None
        if (
            not isinstance(relative, str)
            or posix_path is None
            or not posix_path.parts
            or posix_path.parts[0] != "node_modules"
            or any(part in {"", ".", ".."} for part in posix_path.parts)
            or posix_path.as_posix() != relative
            or not isinstance(name, str)
            or not isinstance(version_value, str)
            or not isinstance(resolved, str)
            or not resolved.startswith("https://registry.npmjs.org/")
            or not isinstance(integrity, str)
            or not any(value.startswith("sha512-") for value in integrity.split())
        ):
            raise BuildError(f"bundled CLI artifact has an unsafe {CLI_RUNTIME_LOCK} package entry")
        if relative in bundled_paths:
            raise BuildError(f"bundled CLI artifact has a duplicate {CLI_RUNTIME_LOCK} package path: {relative}")
        bundled_paths.add(relative)
        metadata_path = cli_root / relative / "package.json"
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise BuildError(f"bundled CLI artifact runtime dependency is missing or invalid: {relative}") from exc
        if metadata.get("name") != name or metadata.get("version") != version_value:
            raise BuildError(f"bundled CLI artifact runtime dependency differs from its manifest: {relative}")
        bundled_names.add(name)
    try:
        package = json.loads((cli_root / "package.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BuildError(f"bundled CLI artifact package.json is invalid: {exc}") from exc
    if not isinstance(package, dict):
        raise BuildError("bundled CLI artifact package.json must contain an object")
    dependencies = package.get("dependencies") or {}
    if not isinstance(dependencies, dict) or not set(dependencies).issubset(bundled_names):
        raise BuildError("bundled CLI artifact does not bundle every declared production dependency")
    readme = (cli_root / "README.md").read_text(encoding="utf-8")
    if "[security policy](SECURITY.md)" not in readme:
        raise BuildError("bundled CLI README does not link its bundled SECURITY.md")


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


def npm_package_files(cli_root: Path) -> list[str]:
    paths = sorted(path.relative_to(cli_root).as_posix() for path in cli_root.rglob("*") if path.is_file())
    if not {"dist/bin.js", "package.json", "README.md", "SECURITY.md"}.issubset(paths):
        raise BuildError("bundled CLI artifact is missing executable, metadata, README, or security policy")
    verify_cli_runtime_bundle(cli_root)
    return paths


def verify_cli_artifact(artifact: Path) -> None:
    """Require recorded provenance to match the tarball just packed, not a fetch pin."""
    lock = load_json(LOCK_PATH)
    cli = lock.get("cli")
    if lock.get("schema") != LOCK_SCHEMA or lock.get("state") != "resolved" or not isinstance(cli, dict):
        raise BuildError("CLI tarball provenance is unresolved or invalid")
    repository = cli.get("repository")
    commit = cli.get("commit")
    recorded = cli.get("artifact")
    if not isinstance(repository, str) or repository != CLI_REPOSITORY:
        raise BuildError("plugin CLI repository is invalid")
    if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit) or set(commit) == {"0"}:
        raise BuildError("plugin CLI commit is invalid")
    if not isinstance(recorded, dict) or recorded.get("file") != artifact.name:
        raise BuildError("CLI tarball filename differs from recorded provenance")
    digest = sha256_file(artifact)
    if recorded.get("sha256") != digest:
        raise BuildError(
            "CLI tarball digest differs from recorded provenance; "
            "pack current screenrig/cli main and rebuild with --write-lock"
        )


def extract_cli_artifact(artifact: Path, destination: Path) -> Path:
    seen: set[str] = set()
    with tarfile.open(artifact, "r:gz") as archive:
        for member in archive.getmembers():
            parts = Path(member.name).parts
            if not parts or parts[0] != "package" or any(part in {"", ".", ".."} for part in parts):
                raise BuildError(f"bundled CLI artifact contains an unsafe path: {member.name}")
            relative = Path(*parts[1:])
            if not relative.parts:
                if not member.isdir():
                    raise BuildError("bundled CLI artifact has an invalid package root")
                continue
            canonical = relative.as_posix()
            if canonical in seen:
                raise BuildError(f"bundled CLI artifact contains a duplicate path: {canonical}")
            seen.add(canonical)
            target = destination / relative
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            elif member.isfile():
                source = archive.extractfile(member)
                if source is None:
                    raise BuildError(f"bundled CLI artifact entry is unreadable: {canonical}")
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open("xb") as output:
                    shutil.copyfileobj(source, output)
            else:
                raise BuildError(f"bundled CLI artifact contains a non-regular entry: {canonical}")
    return destination


@contextmanager
def cli_input(
    cli_artifact: Path | None,
    *,
    write_lock: bool,
    cli_commit: str | None,
    check: bool,
) -> Iterator[tuple[Path, Path, str | None, bool]]:
    with tempfile.TemporaryDirectory(prefix="screenrig-plugin-cli-") as temporary:
        temp = Path(temporary)
        if cli_artifact is None:
            source = sibling_cli_root()
            if source is None:
                raise BuildError("plugin rebuild requires --cli-artifact or a sibling ../cli checkout")
            artifact = temp / CLI_ARTIFACT_NAME
            pack_cli_source(source, artifact)
            commit = cli_commit or git_head(source)
            if check and not write_lock:
                verify_cli_artifact(artifact)
            yield extract_cli_artifact(artifact, temp / "package"), artifact, commit, (not check) or write_lock
            return
        artifact = cli_artifact.expanduser().resolve()
        if not artifact.is_file():
            raise BuildError(f"CLI artifact is missing: {artifact}")
        if not write_lock:
            verify_cli_artifact(artifact)
        commit = cli_commit
        if write_lock and not commit:
            source = sibling_cli_root()
            if source is not None:
                commit = git_head(source)
        yield extract_cli_artifact(artifact, temp / "package"), artifact, commit, write_lock


def stamp_bundled_cli_version(cli_root: Path, release_version: str) -> None:
    """Skill text and the bundled CLI travel together; freshness compares both to plugin CalVer."""
    path = cli_root / "package.json"
    package = load_json(path)
    if package.get("version") == release_version:
        return
    package["version"] = release_version
    path.write_text(json.dumps(package, indent=2) + "\n", encoding="utf-8")


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


def verify_generated_launcher(plugin_root: Path) -> None:
    cli_version = load_json(plugin_root / "cli" / "package.json").get("version")
    launcher = plugin_root / "skills" / PLUGIN_NAME / "scripts" / "screenrig"
    with tempfile.TemporaryDirectory(prefix="screenrig-plugin-config-") as temporary:
        result = subprocess.run(
            [str(launcher), "--json", "version"],
            cwd=plugin_root,
            env={
                "PATH": os.environ.get("PATH", ""),
                "XDG_CONFIG_HOME": str(Path(temporary) / "config"),
            },
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise BuildError("generated plugin launcher did not return JSON offline") from exc
    data = payload.get("data") if isinstance(payload, dict) else None
    if (
        result.returncode != 0
        or result.stderr
        or not isinstance(payload, dict)
        or payload.get("ok") is not True
        or not isinstance(data, dict)
        or not isinstance(cli_version, str)
        or not cli_version
        or data.get("version") != cli_version
    ):
        raise BuildError("generated plugin launcher did not run the bundled CLI with clean offline output")


def copy_docs(plugin_root: Path) -> None:
    """Refresh canonical public files and skills without changing CLI provenance."""
    public_root = PUBLIC_ROOT if PUBLIC_ROOT.is_dir() else ROOT
    plugin_root.mkdir(parents=True, exist_ok=True)
    for relative in PUBLIC_FILES:
        source = public_root / relative
        if not source.is_file():
            raise BuildError(f"public plugin root file is missing: {relative}")
        destination = plugin_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    skill_target = plugin_root / "skills" / PLUGIN_NAME
    if skill_target.exists():
        shutil.rmtree(skill_target)
    shutil.copytree(SKILL, skill_target)


def build(
    output: Path,
    cli_artifact: Path | None = None,
    *,
    write_lock: bool = False,
    cli_commit: str | None = None,
    check: bool = False,
) -> Path:
    metadata = load_json(ROOT / "build" / "plugin.json")
    if metadata.get("name") != PLUGIN_NAME:
        raise BuildError("build/plugin.json name must be screenrig")
    release_version = version()
    plugin_root = output / PLUGIN_NAME
    copy_docs(plugin_root)

    cli_root = plugin_root / "cli"
    with cli_input(cli_artifact, write_lock=write_lock, cli_commit=cli_commit, check=check) as (
        source_root,
        artifact,
        commit,
        should_write,
    ):
        for relative in npm_package_files(source_root):
            source = source_root / relative
            destination = cli_root / relative
            if not source.is_file():
                raise BuildError(f"npm package file is missing: {relative}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        stamp_bundled_cli_version(cli_root, release_version)
        if should_write:
            if not commit:
                raise BuildError("--write-lock requires --cli-commit or a sibling ../cli checkout")
            write_component_lock(commit, artifact)
    (cli_root / "dist" / "bin.js").chmod(0o755)
    emit_manifests(plugin_root, metadata, release_version)
    verify_generated_launcher(plugin_root)
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


def compare_docs(expected: Path, actual: Path) -> list[str]:
    changes = compare(expected / "skills" / PLUGIN_NAME, actual / "skills" / PLUGIN_NAME)
    for relative in PUBLIC_FILES:
        source, target = expected / relative, actual / relative
        if not target.is_file():
            changes.append(f"missing {relative}")
        elif not filecmp.cmp(source, target, shallow=False):
            changes.append(f"changed {relative}")
        elif file_mode(source) != file_mode(target):
            changes.append(f"mode {relative}")
    return changes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument(
        "--docs-only", action="store_true",
        help="refresh canonical public files and skills in an existing bundle; preserve CLI, manifests and provenance",
    )
    parser.add_argument("--cli-artifact", type=Path, help="tarball packed from sibling ../cli or current screenrig/cli main")
    parser.add_argument(
        "--write-lock",
        action="store_true",
        help="record provenance of the tarball just packed; not a fetch pin",
    )
    parser.add_argument(
        "--cli-commit",
        help="commit that produced the packed tarball, recorded as provenance only",
    )
    args = parser.parse_args()
    if args.docs_only and (args.cli_artifact or args.write_lock or args.cli_commit):
        print("build-plugin: --docs-only cannot be combined with CLI artifact or provenance options", file=sys.stderr)
        return 2
    if args.write_lock and args.check:
        print("build-plugin: --write-lock cannot be combined with --check", file=sys.stderr)
        return 2
    if args.cli_commit is not None and not re.fullmatch(r"[0-9a-f]{40}", args.cli_commit):
        print("build-plugin: --cli-commit must be a 40-character lowercase SHA-1", file=sys.stderr)
        return 2
    try:
        if args.docs_only:
            target = PLUGINS / PLUGIN_NAME
            if not (target / "cli" / "package.json").is_file():
                raise BuildError("--docs-only requires an existing generated CLI bundle")
            if args.check:
                with tempfile.TemporaryDirectory(prefix="screenrig-plugin-docs-") as temp:
                    expected = Path(temp) / PLUGIN_NAME
                    copy_docs(expected)
                    changes = compare_docs(expected, target)
                    if changes:
                        print("generated ScreenRig plugin docs are stale:", file=sys.stderr)
                        for change in changes:
                            print(f"  {change}", file=sys.stderr)
                        return 1
                print("generated ScreenRig plugin docs are current; CLI bundle not checked")
                return 0
            copy_docs(target)
            print("updated ScreenRig plugin docs; CLI bundle and provenance unchanged")
            return 0
        if args.check:
            with tempfile.TemporaryDirectory(prefix="screenrig-plugin-") as temp:
                expected = Path(temp) / "plugins"
                build(
                    expected,
                    args.cli_artifact,
                    write_lock=False,
                    cli_commit=args.cli_commit,
                    check=True,
                )
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
        build(
            PLUGINS,
            args.cli_artifact,
            write_lock=args.write_lock or args.cli_artifact is None,
            cli_commit=args.cli_commit,
            check=False,
        )
        print("built ScreenRig plugin")
        return 0
    except BuildError as exc:
        print(f"build-plugin: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
