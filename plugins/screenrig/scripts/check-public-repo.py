#!/usr/bin/env python3
"""Fail closed when the generated plugin is not safe as a public repository."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / "plugins" / "screenrig" if (ROOT / "plugins" / "screenrig").is_dir() else ROOT
EXPECTED_VERSION = "0.1.0"
PLUGIN_REPOSITORY = "https://github.com/screenrig/plugin"
CLI_REPOSITORY = "git+https://github.com/screenrig/cli.git"
TEXT_SUFFIXES = {"", ".d.ts", ".js", ".json", ".md", ".py", ".sh", ".toml", ".yaml", ".yml"}
IGNORED_PARTS = {".git", "node_modules"}


def git(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def load(path: Path, errors: list[str]) -> dict[str, object]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{path.relative_to(ROOT)} is unreadable: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{path.relative_to(ROOT)} must contain a JSON object")
        return {}
    return value


def check_metadata(errors: list[str]) -> None:
    for platform in ("codex", "claude"):
        relative = BUNDLE.relative_to(ROOT) / f".{platform}-plugin/plugin.json"
        manifest = load(ROOT / relative, errors)
        expected = {
            "name": "screenrig",
            "version": EXPECTED_VERSION,
            "repository": PLUGIN_REPOSITORY,
            "license": "Apache-2.0",
        }
        for field, value in expected.items():
            if manifest.get(field) != value:
                errors.append(f"{relative} {field!r} must be {value!r}")

    package_path = BUNDLE / "cli" / "package.json"
    package = load(package_path, errors)
    expected_package = {
        "name": "screenrig",
        "version": EXPECTED_VERSION,
        "private": False,
        "license": "Apache-2.0",
    }
    for field, value in expected_package.items():
        if package.get(field) != value:
            errors.append(f"{package_path.relative_to(ROOT)} {field!r} must be {value!r}")
    repository = package.get("repository")
    if not isinstance(repository, dict) or repository.get("url") != CLI_REPOSITORY:
        errors.append(f"{package_path.relative_to(ROOT)} repository.url must be {CLI_REPOSITORY}")
    for field in ("dependencies", "optionalDependencies", "peerDependencies"):
        if package.get(field):
            errors.append(f"bundled CLI must not require unavailable {field}")


def check_public_tree(errors: list[str]) -> None:
    for required in (
        "LICENSE",
        "README.md",
        "SECURITY.md",
        ".gitleaks.toml",
    ):
        if not (ROOT / required).is_file():
            errors.append(f"missing public root file: {required}")
    workflow_path = ROOT / ".github" / "workflows" / "ci.yml"
    if workflow_path.is_file():
        workflow = workflow_path.read_text(encoding="utf-8")
        for fact in (
            "fetch-depth: 0",
            "scripts/package-release.sh",
            "git -C \"${RUNNER_TEMP}/screenrig-cli-source\" fetch --no-tags --depth=1",
            "npm --prefix \"${RUNNER_TEMP}/screenrig-cli-source\" run build",
            "--cli-artifact",
            "--cli-source",
            "python3 scripts/validate-plugin.py",
            "name: screenrig-plugin",
            "gitleaks\" git",
        ):
            if fact not in workflow:
                errors.append(f"public CI is missing required gate: {fact}")
    for required in (
        "skills/screenrig/SKILL.md",
        "skills/screenrig/scripts/screenrig",
        "cli/dist/bin.js",
    ):
        if not (BUNDLE / required).is_file():
            errors.append(f"missing public bundle file: {(BUNDLE / required).relative_to(ROOT)}")

    prohibited_names = {
        "SPLIT_" + "HANDOFF.md",
        "FABLE_REVIEW.md",
        "HAND" + "OFF.md",
    }
    forbidden_fragments = (
        "github.com/telemetry" + "OS/screenrig",
        "git@github.com:telemetry" + "OS/screenrig",
        "/home/" + "gersham/",
        ".codex-" + "tmp",
        ".test" + "runs/",
    )
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or any(part in IGNORED_PARTS for part in path.relative_to(ROOT).parts):
            continue
        relative = path.relative_to(ROOT)
        if relative.name in prohibited_names:
            errors.append(f"internal evidence file is not public: {relative}")
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for fragment in forbidden_fragments:
            if fragment in text:
                errors.append(f"private reference {fragment!r} in {relative}")

    # Every static ESM import in the bundled CLI must resolve inside the bundle.
    import_pattern = re.compile(r'(?:from\s+|import\()["\'](\.[^"\']+)["\']')
    for path in (BUNDLE / "cli" / "dist").rglob("*.js"):
        text = path.read_text(encoding="utf-8")
        for specifier in import_pattern.findall(text):
            destination = (path.parent / specifier).resolve()
            if ROOT.resolve() not in destination.parents or not destination.is_file():
                errors.append(f"unresolved bundled import {specifier!r} in {path.relative_to(ROOT)}")


def check_history(errors: list[str]) -> None:
    top = git("rev-parse", "--show-toplevel")
    if top.returncode != 0:
        errors.append("public repository must be a Git worktree")
        return
    if Path(top.stdout.strip()).resolve() != ROOT.resolve():
        errors.append("run this check only when the generated plugin is the public repository root")
        return

    shallow = git("rev-parse", "--is-shallow-repository")
    if shallow.returncode != 0 or shallow.stdout.strip() != "false":
        errors.append("full-history checks require a non-shallow checkout")

    names = git("log", "--all", "--format=", "--name-only")
    if names.returncode != 0:
        errors.append(f"cannot inspect Git history paths: {names.stderr.strip()}")
        return
    prohibited = re.compile(
        r"(^|/)(?:HANDOFF\.md|SPLIT_HANDOFF\.md|FABLE_REVIEW\.md|\.test"
        r"runs|\.codex-"
        r"tmp)(?:$|/)"
    )
    leaked_paths = sorted({line for line in names.stdout.splitlines() if prohibited.search(line)})
    if leaked_paths:
        errors.append("internal evidence exists in Git history: " + ", ".join(leaked_paths[:5]))

    forbidden_history = (
        "github.com/telemetry" + "OS/screenrig",
        "git@github.com:telemetry" + "OS/screenrig",
        "/home/" + "gersham/",
        ".codex-" + "tmp",
        ".test" + "runs/",
    )
    for fragment in forbidden_history:
        patches = git("log", "--all", "-G", fragment, "--format=%H")
        if patches.returncode != 0:
            errors.append(f"cannot inspect Git history content: {patches.stderr.strip()}")
            break
        if patches.stdout.strip():
            errors.append(f"private reference {fragment!r} exists in Git history")


def run_smoke(errors: list[str]) -> None:
    commands = (
        ["node", str((BUNDLE / "cli" / "dist" / "bin.js").relative_to(ROOT)), "--json", "version"],
        [str((BUNDLE / "skills" / "screenrig" / "scripts" / "screenrig").relative_to(ROOT)), "--json", "version"],
    )
    for command in commands:
        result = subprocess.run(
            command,
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        try:
            payload = json.loads(result.stdout)
        except json.JSONDecodeError:
            payload = {}
        data = payload.get("data") or {}
        if (
            result.returncode != 0
            or result.stderr
            or payload.get("ok") is not True
            or not isinstance(data, dict)
            or data.get("version") != EXPECTED_VERSION
        ):
            errors.append(f"public smoke failed: {' '.join(command)}")


def main() -> int:
    errors: list[str] = []
    check_metadata(errors)
    check_public_tree(errors)
    check_history(errors)
    run_smoke(errors)
    if errors:
        print("public plugin repository check failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("public plugin repository check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
