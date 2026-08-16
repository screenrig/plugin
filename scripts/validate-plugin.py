#!/usr/bin/env python3
"""Validate ScreenRig marketplace discovery and generated plugin boundaries."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
PLUGIN = ROOT / "plugins" / "screenrig"
PLUGIN_REPOSITORY = "https://github.com/screenrig/plugin"
CLI_REPOSITORY = "git+https://github.com/screenrig/cli.git"
RELEASE_VERSION = "0.1.0"
CLI_SOURCE_FILES = (
    "src/commands.ts",
    "src/client.ts",
    "src/localhost-smoke.ts",
    "src/server-smoke.ts",
)
errors: list[str] = []


def requested_cli_source(explicit: str | None) -> tuple[Path | None, str | None]:
    if explicit:
        return Path(explicit).expanduser(), "--cli-source"
    env = os.environ.get("SCREENRIG_CLI_SOURCE")
    if env:
        return Path(env).expanduser(), "SCREENRIG_CLI_SOURCE"
    sibling = ROOT.parent / "cli"
    if sibling.is_dir():
        return sibling, "sibling cli checkout"
    return None, None


def require_cli_source(explicit: str | None) -> Path | None:
    path, origin = requested_cli_source(explicit)
    if path is None:
        errors.append(
            "CLI source is required for pairing facts and the stale-language audit; "
            "pass --cli-source, set SCREENRIG_CLI_SOURCE, or check out screenrig/cli "
            "as a sibling directory"
        )
        return None
    missing = [relative for relative in CLI_SOURCE_FILES if not (path / relative).is_file()]
    if missing:
        errors.append(f"{origin} is not a ScreenRig CLI checkout (missing {', '.join(missing)})")
        return None
    return path


def display_path(path: Path, cli_source: Path | None) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        pass
    if cli_source is not None:
        try:
            return f"cli/{path.relative_to(cli_source).as_posix()}"
        except ValueError:
            pass
    return path.name


def load(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{path.relative_to(ROOT)}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"{path.relative_to(ROOT)}: expected JSON object")
        return {}
    return value


def check_marketplaces() -> None:
    codex = load(ROOT / ".agents" / "plugins" / "marketplace.json")
    entries = codex.get("plugins") or []
    if len(entries) != 1 or not isinstance(entries[0], dict):
        errors.append(".agents/plugins/marketplace.json: expected one plugin")
    else:
        entry = entries[0]
        source = entry.get("source") or {}
        policy = entry.get("policy") or {}
        if entry.get("name") != "screenrig" or source.get("path") != "./plugins/screenrig":
            errors.append(".agents/plugins/marketplace.json: invalid ScreenRig source")
        if policy != {"installation": "AVAILABLE", "authentication": "ON_USE"}:
            errors.append(".agents/plugins/marketplace.json: expected AVAILABLE/ON_USE policy")
        if "version" in entry:
            errors.append(".agents/plugins/marketplace.json: Codex entry must be version-free")

    claude = load(ROOT / ".claude-plugin" / "marketplace.json")
    claude_entries = claude.get("plugins") or []
    if len(claude_entries) != 1 or not isinstance(claude_entries[0], dict):
        errors.append(".claude-plugin/marketplace.json: expected one plugin")
        return
    entry = claude_entries[0]
    if entry.get("name") != "screenrig" or entry.get("source") != "./plugins/screenrig":
        errors.append(".claude-plugin/marketplace.json: invalid ScreenRig source")
    version = entry.get("version")
    if version != RELEASE_VERSION:
        errors.append(f".claude-plugin/marketplace.json: version must be {RELEASE_VERSION}")
    if entry.get("repository") != PLUGIN_REPOSITORY or entry.get("license") != "Apache-2.0":
        errors.append(".claude-plugin/marketplace.json: public repository/license metadata drift")
    for platform in ("codex", "claude"):
        manifest = load(PLUGIN / f".{platform}-plugin" / "plugin.json")
        if manifest.get("name") != "screenrig" or manifest.get("version") != version:
            errors.append(f"plugins/screenrig/.{platform}-plugin/plugin.json: name/version drift")
        if manifest.get("repository") != PLUGIN_REPOSITORY or manifest.get("license") != "Apache-2.0":
            errors.append(f"plugins/screenrig/.{platform}-plugin/plugin.json: public repository/license drift")


def check_package() -> None:
    required = [
        PLUGIN / "skills" / "screenrig" / "SKILL.md",
        PLUGIN / "skills" / "screenrig" / "scripts" / "screenrig",
        PLUGIN / "cli" / "dist" / "bin.js",
        PLUGIN / "cli" / "package.json",
        PLUGIN / "LICENSE",
        PLUGIN / "README.md",
        PLUGIN / "SECURITY.md",
        PLUGIN / ".gitleaks.toml",
        PLUGIN / ".github" / "workflows" / "ci.yml",
        PLUGIN / "scripts" / "check-public-repo.py",
    ]
    for path in required:
        if not path.is_file():
            errors.append(f"missing {path.relative_to(ROOT)}")
    for executable in required[1:3]:
        if executable.is_file() and not stat.S_IMODE(executable.stat().st_mode) & 0o111:
            errors.append(f"{executable.relative_to(ROOT)}: must be executable")
    wrapper = required[1]
    if wrapper.is_file() and "../../../cli/dist/bin.js" not in wrapper.read_text(encoding="utf-8"):
        errors.append("plugin wrapper must resolve the CLI by package-relative path")
    if wrapper.is_file():
        wrapper_text = wrapper.read_text(encoding="utf-8")
        for fact in ("command -v node", "Node.js 20.11 or newer", "major === 20 && minor >= 11"):
            if fact not in wrapper_text:
                errors.append(f"plugin wrapper is missing the Node.js preflight fact: {fact}")
        dirname = shutil.which("dirname")
        if dirname is None:
            errors.append("cannot exercise the wrapper's missing-Node.js preflight: dirname is unavailable")
        else:
            with tempfile.TemporaryDirectory(prefix="screenrig-wrapper-path-") as temporary:
                Path(temporary, "dirname").symlink_to(dirname)
                missing_node = subprocess.run(
                    [str(wrapper), "--json", "version"],
                    cwd=ROOT,
                    env={"PATH": temporary},
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    check=False,
                )
            if (
                missing_node.returncode != 69
                or missing_node.stdout
                or missing_node.stderr.strip()
                != "ScreenRig requires Node.js 20.11 or newer; install or expose a compatible node runtime, then retry."
            ):
                errors.append("plugin wrapper missing-Node.js preflight is not deterministic")
    forbidden_packaged = [path for path in (PLUGIN / "cli" / "dist").rglob("*") if path.is_file() and ".test." in path.name]
    if forbidden_packaged:
        errors.append("packaged CLI contains test output")
    if wrapper.is_file():
        result = subprocess.run(
            [str(wrapper), "--json", "version"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        try:
            envelope = json.loads(result.stdout)
        except json.JSONDecodeError:
            envelope = {}
        data = envelope.get("data") or {}
        if (
            result.returncode != 0
            or envelope.get("ok") is not True
            or not isinstance(data, dict)
            or data.get("version") != RELEASE_VERSION
            or result.stderr
        ):
            errors.append("packaged skill wrapper did not execute the bundled CLI with clean JSON output")
    package = load(PLUGIN / "cli" / "package.json")
    repository = package.get("repository") or {}
    if (
        package.get("version") != RELEASE_VERSION
        or package.get("private") is not False
        or package.get("license") != "Apache-2.0"
        or not isinstance(repository, dict)
        or repository.get("url") != CLI_REPOSITORY
    ):
        errors.append("packaged CLI public release metadata drift")
    packaged_commands = PLUGIN / "cli" / "dist" / "commands.js"
    if packaged_commands.is_file():
        commands_text = packaged_commands.read_text(encoding="utf-8")
        for fact in ("auth revoke --yes", "/api/v1/account/credential/revoke"):
            if fact not in commands_text:
                errors.append(f"packaged CLI credential lifecycle missing: {fact}")


def check_no_alternate_surfaces(cli_source: Path | None) -> None:
    for path in PLUGIN.rglob("*"):
        if path.is_file() and path.name in {".mcp.json", "mcp.json"}:
            errors.append(f"{path.relative_to(ROOT)}: unsupported server declaration")
        if path.is_file() and path.suffix in {".json", ".md", ".yaml", ".yml"}:
            text = path.read_text(encoding="utf-8")
            if re.search(r'"mcpServers"\s*:', text):
                errors.append(f"{path.relative_to(ROOT)}: unsupported server manifest key")

    audit_paths = [ROOT / "skills" / "screenrig" / "SKILL.md"]
    if cli_source is not None:
        audit_paths.extend(cli_source / relative for relative in CLI_SOURCE_FILES)
    required_pairing = {
        "skills/screenrig/SKILL.md": [
            "screen pair CODE",
            "23456789ABCDEFGHJKMNPQRSTUVWXYZ",
            "screen provision --open",
            "screen provision --print-url",
            "browser setup --code ABC-234",
            "fragment-free Player public URL",
        ],
    }
    required_cli_pairing = {
        "src/commands.ts": [
            "screen pair CODE [--label LABEL]",
            "/api/v1/screens/pair",
            "screen provision (--open | --print-url)",
            "/api/v1/screens/provision",
            "browser setup --code CODE [--open]",
            "/api/v1/account/browser-links/claim",
        ],
    }
    for relative, facts in required_pairing.items():
        path = ROOT / relative
        if not path.is_file():
            errors.append(f"{relative}: required pairing file missing")
            continue
        text = path.read_text(encoding="utf-8")
        for fact in facts:
            if fact not in text:
                errors.append(f"{relative}: required pairing fact missing: {fact}")
    if cli_source is not None:
        for relative, facts in required_cli_pairing.items():
            path = cli_source / relative
            label = f"cli/{relative}"
            if not path.is_file():
                errors.append(f"{label}: required pairing file missing")
                continue
            text = path.read_text(encoding="utf-8")
            for fact in facts:
                if fact not in text:
                    errors.append(f"{label}: required pairing fact missing: {fact}")

    required_marketplace = {
        "README.md": [
            "https://github.com/screenrig/plugin",
            "claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user",
            "claude plugin install screenrig@screenrig --scope user",
            "codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json",
            "codex plugin add screenrig@screenrig --json",
            "claude plugin list --json",
            "codex plugin list --json",
            "Node.js 20.11 or newer",
            "$XDG_CONFIG_HOME/screenrig/config.json",
            "%APPDATA%\\screenrig\\config.json",
            "auth revoke --yes",
            "empty `204` response",
            "separate new account",
            "retrying the exact revocation is safe",
            "SCREENRIG_FFPROBE",
            "--no-transcode",
            "encodes video to H.264",
        ],
        "skills/screenrig/SKILL.md": [
            "https://github.com/screenrig/plugin",
            "claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user",
            "claude plugin install screenrig@screenrig --scope user",
            "codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json",
            "codex plugin add screenrig@screenrig --json",
            "claude plugin list --json",
            "codex plugin list --json",
            "Node.js 20.11 or newer",
            "authorizes adding",
            "presentation-only",
            "what content",
            "$XDG_CONFIG_HOME/screenrig/config.json",
            "%APPDATA%\\screenrig\\config.json",
            "I authorize you to install the official ScreenRig plugin from https://github.com/screenrig/plugin",
            "auth revoke --yes",
            "server-first",
            "empty `204`",
            "transient authenticated-operation state",
            "separate new account",
            "On a failed or ambiguous response",
            "Do not claim that `doctor` repairs",
            "browser_already_paired",
            "browser_link_not_claimed",
            "handoff_session_rate_limited",
            "do not use revocation as generic recovery",
            "SCREENRIG_FFMPEG",
            "--no-transcode",
            "--codec hevc",
            "H.264 MP4 by default",
            "fails `media upload` alone",
        ],
    }
    for relative, facts in required_marketplace.items():
        text = re.sub(r"\s+", " ", (ROOT / relative).read_text(encoding="utf-8"))
        for fact in facts:
            if fact not in text:
                errors.append(f"{relative}: required marketplace fact missing: {fact}")
    if "request ID for support" in (ROOT / "skills/screenrig/SKILL.md").read_text(encoding="utf-8"):
        errors.append("skills/screenrig/SKILL.md: nonexistent support recovery path remains")
    forbidden = {
        "account create": re.compile(r"\baccount create\b", re.IGNORECASE),
        "email onboarding": re.compile(r"--email|requires? email", re.IGNORECASE),
        "token paste": re.compile(r"--token|SCREENRIG_TOKEN", re.IGNORECASE),
        "retired screen creation": re.compile(r"\bscreen\s+create\b", re.IGNORECASE),
        "retired bootstrap onboarding": re.compile(
            r"#bootstrap=|/api/v1/screens/bootstrap|/runtime/v1/device-sessions/bootstrap|ScreenBootstrap|PlayerBootstrap|bootstrap grant",
            re.IGNORECASE,
        ),
        "retired pairing flag": re.compile(r"\bscreen\s+pair\s+--code\b", re.IGNORECASE),
        "Grid layout": re.compile(r"grid_style|gridStyle|gridTemplate|RuntimeGrid|allowUpscale|CSS Grid", re.IGNORECASE),
        "retired magic fragment": re.compile(r"#(?:grant|token|magic)=", re.IGNORECASE),
        "retired acknowledgement mutation": re.compile(
            r"credential-issuances/.*/ack|issuance acknowledgement|acknowledge enrollment",
            re.IGNORECASE,
        ),
    }
    for root in audit_paths:
        if not root.is_file():
            errors.append(f"{display_path(root, cli_source)}: required stale-language audit file missing")
            continue
        text = root.read_text(encoding="utf-8")
        for label, pattern in forbidden.items():
            if pattern.search(text):
                errors.append(f"{display_path(root, cli_source)}: stale {label} language")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cli-artifact")
    parser.add_argument("--cli-source")
    args = parser.parse_args()
    command = [sys.executable, str(ROOT / "scripts" / "build-plugin.py"), "--check"]
    if args.cli_artifact:
        command.extend(["--cli-artifact", args.cli_artifact])
    build = subprocess.run(command, cwd=ROOT)
    if build.returncode != 0:
        errors.append("generated plugin build check failed")
    check_marketplaces()
    check_package()
    check_no_alternate_surfaces(require_cli_source(args.cli_source))
    if errors:
        print("ScreenRig plugin validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("ScreenRig plugin validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
