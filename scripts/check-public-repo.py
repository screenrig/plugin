#!/usr/bin/env python3
"""Fail closed when the generated plugin is not safe as a public repository."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / "plugins" / "screenrig"
PLUGIN_PLACEHOLDER = "0.1.2"
CLI_PLACEHOLDER = "0.1.0"
PRODUCT_VERSION = re.compile(r"^\d{2}\.(?:0[1-9]|1[0-2])\.[1-9]\d*$")


def is_plugin_version(value: object) -> bool:
    return isinstance(value, str) and (value == PLUGIN_PLACEHOLDER or PRODUCT_VERSION.fullmatch(value) is not None)


def is_cli_version(value: object) -> bool:
    return isinstance(value, str) and (value == CLI_PLACEHOLDER or PRODUCT_VERSION.fullmatch(value) is not None)


PLUGIN_REPOSITORY = "https://github.com/screenrig/plugin"
CLI_REPOSITORY = "git+https://github.com/screenrig/cli.git"
ALLOWED_CLI_PRODUCTION_DEPENDENCIES = frozenset(
    {"@napi-rs/canvas", "ajv", "ajv-formats", "commander"}
)
# The CLI fetches the renderer platform package for its machine on first render.
RENDERER_PLATFORM_PREFIX = "@napi-rs/canvas-"
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
            "repository": PLUGIN_REPOSITORY,
            "license": "Apache-2.0",
        }
        for field, value in expected.items():
            if manifest.get(field) != value:
                errors.append(f"{relative} {field!r} must be {value!r}")
        if not is_plugin_version(manifest.get("version")):
            errors.append(f"{relative} version must be 0.1.2 or YY.MM.N")

    package_path = BUNDLE / "cli" / "package.json"
    package = load(package_path, errors)
    expected_package = {
        "name": "screenrig",
        "private": False,
        "license": "Apache-2.0",
    }
    for field, value in expected_package.items():
        if package.get(field) != value:
            errors.append(f"{package_path.relative_to(ROOT)} {field!r} must be {value!r}")
    if not is_cli_version(package.get("version")):
        errors.append(f"{package_path.relative_to(ROOT)} version must be 0.1.0 or YY.MM.N")
    repository = package.get("repository")
    if not isinstance(repository, dict) or repository.get("url") != CLI_REPOSITORY:
        errors.append(f"{package_path.relative_to(ROOT)} repository.url must be {CLI_REPOSITORY}")
    deps = package.get("dependencies")
    if not isinstance(deps, dict):
        errors.append(f"{package_path.relative_to(ROOT)} dependencies must be an object")
    else:
        extra = sorted(set(deps) - ALLOWED_CLI_PRODUCTION_DEPENDENCIES)
        missing = sorted(ALLOWED_CLI_PRODUCTION_DEPENDENCIES - set(deps))
        if extra or missing:
            errors.append(
                f"bundled CLI dependencies must be exactly {sorted(ALLOWED_CLI_PRODUCTION_DEPENDENCIES)}; "
                f"extra {extra}; missing {missing}"
            )
    for field in ("optionalDependencies", "peerDependencies"):
        if package.get(field):
            errors.append(f"bundled CLI must not require unavailable {field}")
    runtime_path = BUNDLE / "cli" / "runtime-dependencies.lock.json"
    runtime = load(runtime_path, errors)
    runtime_packages = runtime.get("packages")
    if runtime.get("schema") != "screenrig.cli-runtime-dependencies/v1" or not isinstance(runtime_packages, list) or not runtime_packages:
        errors.append(f"{runtime_path.relative_to(ROOT)} must contain the resolved CLI runtime dependency closure")
        return
    # dist/bin.js bundles its dependencies; THIRD_PARTY_NOTICES names each one it carries.
    notices_path = BUNDLE / "cli" / "THIRD_PARTY_NOTICES"
    try:
        notices = notices_path.read_text(encoding="utf-8")
    except OSError:
        errors.append(f"missing {notices_path.relative_to(ROOT)}")
        return
    noticed = {f"{name}@{version}" for name, version in re.findall(r"^(\S+)@(\d\S*) \(", notices, re.M)}
    if (BUNDLE / "cli" / "node_modules").exists():
        errors.append("bundled CLI must carry its dependencies inside dist/bin.js, not node_modules")
    bundled_names: set[str] = set()
    for entry in runtime_packages:
        if not isinstance(entry, dict) or not isinstance(entry.get("name"), str) or not isinstance(entry.get("version"), str):
            errors.append(f"{runtime_path.relative_to(ROOT)} contains an invalid package entry")
            continue
        name, version = entry["name"], entry["version"]
        if name.startswith(RENDERER_PLATFORM_PREFIX):
            continue
        if f"{name}@{version}" in noticed:
            bundled_names.add(name)
            noticed.discard(f"{name}@{version}")
    if noticed:
        errors.append(f"bundled CLI runtime dependency differs from its manifest: {sorted(noticed)}")
    if isinstance(deps, dict) and not set(deps).issubset(bundled_names):
        errors.append("bundled CLI is missing a declared production dependency")


def check_public_tree(errors: list[str]) -> None:
    for required in (
        "LICENSE",
        "README.md",
        "SECURITY.md",
    ):
        if not (ROOT / required).is_file():
            errors.append(f"missing public root file: {required}")
    workflow_path = ROOT / ".github" / "workflows" / "ci.yml"
    if workflow_path.is_file():
        workflow = workflow_path.read_text(encoding="utf-8")
        for fact in (
            "fetch-depth: 0",
            "scripts/package-release.sh",
            "git -C \"${RUNNER_TEMP}/screenrig-cli-source\" fetch --depth=1",
            "\"https://github.com/${repository}.git\" main",
            "python3 scripts/calver.py cli-stamp",
            "SCREENRIG_VERSION",
            "npm --prefix \"${RUNNER_TEMP}/screenrig-cli-source\" run build",
            "--cli-artifact",
            "--write-lock",
            "--cli-commit",
            "--cli-source",
            "python3 scripts/validate-plugin.py",
            "python3 scripts/test.py",
            "name: screenrig-plugin",
            "gitleaks\" git",
            "contents: write",
            "actions: write",
            "after_rebundle",
            "actions/workflows/ci.yml/dispatches",
            "jq -r .cli.commit",
            "github.ref == 'refs/heads/main'",
            "git push",
            "GITHUB_TOKEN",
            "Bundled CLI digest",
        ):
            if fact not in workflow:
                errors.append(f"public CI is missing required gate: {fact}")
        if "github.run_number" in workflow:
            errors.append("public CI must not use github.run_number for CalVer")
    if (ROOT / "plugins" / "screenrig").is_dir() and not (ROOT / "scripts" / "calver.py").is_file():
        errors.append("missing public root file: scripts/calver.py")
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

    # The CLI is one bundled file, so it has no relative module to resolve.
    dist = sorted(path.relative_to(BUNDLE).as_posix() for path in (BUNDLE / "cli" / "dist").rglob("*") if path.is_file())
    if dist != ["cli/dist/bin.js"]:
        errors.append(f"bundled CLI must be the single file cli/dist/bin.js; found {dist}")


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
    package = load(BUNDLE / "cli" / "package.json", errors)
    cli_version = package.get("version")
    commands = (
        ["node", str((BUNDLE / "cli" / "dist" / "bin.js").relative_to(ROOT)), "--json", "version"],
        [str((BUNDLE / "skills" / "screenrig" / "scripts" / "screenrig").relative_to(ROOT)), "--json", "version"],
    )
    for command in commands:
        with tempfile.TemporaryDirectory(prefix="screenrig-public-config-") as temporary:
            result = subprocess.run(
                command,
                cwd=ROOT,
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
        except json.JSONDecodeError:
            payload = {}
        data = payload.get("data") or {}
        if (
            result.returncode != 0
            or result.stderr
            or payload.get("ok") is not True
            or not isinstance(data, dict)
            or data.get("version") != cli_version
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
