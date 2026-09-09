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
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
PLUGIN = ROOT / "plugins" / "screenrig"
PLUGIN_REPOSITORY = "https://github.com/screenrig/plugin"
CLI_REPOSITORY = "git+https://github.com/screenrig/cli.git"
CLI_RUNTIME_LOCK = "runtime-dependencies.lock.json"
PLUGIN_PLACEHOLDER = "0.1.2"
CLI_PLACEHOLDER = "0.1.0"
PRODUCT_VERSION = re.compile(r"^\d{2}\.(?:0[1-9]|1[0-2])\.(?:0-dev|[1-9]\d*)$")


def is_plugin_version(value: object) -> bool:
    return isinstance(value, str) and (value == PLUGIN_PLACEHOLDER or PRODUCT_VERSION.fullmatch(value) is not None)


def is_cli_version(value: object) -> bool:
    return isinstance(value, str) and (value == CLI_PLACEHOLDER or PRODUCT_VERSION.fullmatch(value) is not None)


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
            "CLI source is required for the stale-language audit; "
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
    if not is_plugin_version(version):
        errors.append(".claude-plugin/marketplace.json: version must be 0.1.2, YY.MM.N, or YY.MM.0-dev")
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
    canonical_wrapper = ROOT / "skills" / "screenrig" / "scripts" / "screenrig"
    if not canonical_wrapper.is_file():
        errors.append("skills/screenrig/scripts/screenrig: canonical launcher missing")
    else:
        canonical_text = canonical_wrapper.read_text(encoding="utf-8")
        for fact in (
            "../../../cli/dist/bin.js",
            "GROK_PLUGIN_ROOT",
            "SCREENRIG_PLUGIN_ROOT",
            "CLAUDE_PLUGIN_ROOT",
            "CODEX_PLUGIN_ROOT",
            "pwd -P",
            "source checkout build cli/dist/bin.js",
        ):
            if fact not in canonical_text:
                errors.append(f"canonical launcher is missing resolve fact: {fact}")
        if "SCREENRIG_CLI" in canonical_text:
            errors.append("canonical launcher must not add a SCREENRIG_CLI override")
    freshness = ROOT / "skills" / "screenrig" / "scripts" / "screenrig-plugin-freshness"
    if not freshness.is_file():
        errors.append("skills/screenrig/scripts/screenrig-plugin-freshness: canonical helper missing")
    else:
        if not stat.S_IMODE(freshness.stat().st_mode) & 0o111:
            errors.append("skills/screenrig/scripts/screenrig-plugin-freshness: must be executable")
        freshness_text = freshness.read_text(encoding="utf-8")
        for fact in (
            "https://raw.githubusercontent.com/screenrig/plugin/main/.claude-plugin/marketplace.json",
            "plugins[0].version",
            "continue_installed",
            "published_version_unavailable",
            "GROK_PLUGIN_ROOT",
            "CLAUDE_PLUGIN_ROOT",
            "CODEX_PLUGIN_ROOT",
        ):
            if fact not in freshness_text:
                errors.append(f"canonical plugin-freshness helper is missing fact: {fact}")
        if "npm i -g" in freshness_text or "SCREENRIG_TOKEN" in freshness_text:
            errors.append("canonical plugin-freshness helper must not teach a global install or token")
        helper_test = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "test-plugin-freshness.py")],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if helper_test.returncode != 0:
            errors.append("plugin-freshness helper tests failed")
            if helper_test.stderr.strip():
                errors.append(helper_test.stderr.strip())
        skill_commands = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "test-skill-commands.py")],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if skill_commands.returncode != 0:
            errors.append("skill-vs-binary command check failed")
            if skill_commands.stderr.strip():
                errors.append(skill_commands.stderr.strip())
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
    package = load(PLUGIN / "cli" / "package.json")
    cli_version = package.get("version")
    if wrapper.is_file():
        with tempfile.TemporaryDirectory(prefix="screenrig-plugin-config-") as temporary:
            result = subprocess.run(
                [str(wrapper), "--json", "version"],
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
            envelope = json.loads(result.stdout)
        except json.JSONDecodeError:
            envelope = {}
        data = envelope.get("data") or {}
        if (
            result.returncode != 0
            or envelope.get("ok") is not True
            or not isinstance(data, dict)
            or data.get("version") != cli_version
            or result.stderr
        ):
            errors.append("packaged skill wrapper did not execute the bundled CLI with clean JSON output")
    repository = package.get("repository") or {}
    if (
        not is_cli_version(package.get("version"))
        or package.get("private") is not False
        or package.get("license") != "Apache-2.0"
        or not isinstance(repository, dict)
        or repository.get("url") != CLI_REPOSITORY
    ):
        errors.append("packaged CLI public release metadata drift")
    dependencies = package.get("dependencies")
    runtime_path = PLUGIN / "cli" / CLI_RUNTIME_LOCK
    runtime = load(runtime_path)
    runtime_packages = runtime.get("packages")
    if (
        runtime.get("schema") != "screenrig.cli-runtime-dependencies/v1"
        or not isinstance(runtime.get("package_lock_sha256"), str)
        or re.fullmatch(r"[0-9a-f]{64}", str(runtime.get("package_lock_sha256"))) is None
        or not isinstance(runtime_packages, list)
        or not runtime_packages
    ):
        errors.append(f"{runtime_path.relative_to(ROOT)}: invalid runtime dependency manifest")
    else:
        bundled_names: set[str] = set()
        bundled_paths: set[str] = set()
        for entry in runtime_packages:
            if not isinstance(entry, dict):
                errors.append(f"{runtime_path.relative_to(ROOT)}: invalid package entry")
                continue
            relative = entry.get("path")
            name = entry.get("name")
            version_value = entry.get("version")
            resolved = entry.get("resolved")
            integrity = entry.get("integrity")
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
                errors.append(f"{runtime_path.relative_to(ROOT)}: unsafe package entry")
                continue
            if relative in bundled_paths:
                errors.append(f"{runtime_path.relative_to(ROOT)}: duplicate package path {relative}")
                continue
            bundled_paths.add(relative)
            metadata = load(PLUGIN / "cli" / relative / "package.json")
            if metadata.get("name") != name or metadata.get("version") != version_value:
                errors.append(f"packaged CLI runtime dependency differs from its manifest: {relative}")
            bundled_names.add(name)
        if not isinstance(dependencies, dict) or not set(dependencies).issubset(bundled_names):
            errors.append("packaged CLI is missing a declared production dependency")
    packaged_commands = PLUGIN / "cli" / "dist" / "commands.js"
    if packaged_commands.is_file():
        commands_text = packaged_commands.read_text(encoding="utf-8")
        for fact in ("auth revoke --yes", "/api/v1/account/credential/revoke"):
            if fact not in commands_text:
                errors.append(f"packaged CLI credential lifecycle missing: {fact}")
    cli_readme = PLUGIN / "cli" / "README.md"
    if not cli_readme.is_file():
        errors.append("packaged CLI README is missing")
    else:
        readme_text = cli_readme.read_text(encoding="utf-8")
        if "[security policy](SECURITY.md)" not in readme_text:
            errors.append("packaged CLI README does not link its bundled SECURITY.md")
        if not (PLUGIN / "cli" / "SECURITY.md").is_file():
            errors.append("packaged CLI SECURITY.md is missing")


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
    required_marketplace = {
        # README.md is the public marketing face of the marketplace, not the agent
        # contract. It asserts the product line, the meter, and the official install
        # only; the operative behavior facts live in skills/screenrig/SKILL.md below.
        "README.md": [
            "Signage and Kiosk infrastructure for AI Agents",
            "Start free. Pay for what you use.",
            "$0.09/GB bandwidth, $0.14/GB-month storage",
            "No per-screen subscription",
            "No per-device price",
            "The Player web app (PWA) is available today",
            "product direction, not public downloads",
            "media generate",
            "as the whole page",
            "slide-deck-like",
            "I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.",
            "https://github.com/screenrig/plugin",
            "claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user",
            "claude plugin install screenrig@screenrig --scope user",
            "codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json",
            "codex plugin add screenrig@screenrig --json",
            "grok plugin marketplace add https://github.com/screenrig/plugin.git",
            "grok plugin install screenrig --trust",
            "--trust",
            "GROK_PLUGIN_ROOT",
            "claude plugin list --json",
            "codex plugin list --json",
            "Node.js 20.11 or newer",
            "package-relative launcher",
            "No codec fallback",
            "plugins[0].version",
            "refresh the plugin when either is stale",
            "Skill text and the bundled CLI update together",
        ],
        "skills/screenrig/SKILL.md": [
            "Signage and Kiosk infrastructure for AI Agents",
            "https://github.com/screenrig/plugin",
            "claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user",
            "claude plugin install screenrig@screenrig --scope user",
            "codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json",
            "codex plugin add screenrig@screenrig --json",
            "grok plugin marketplace add https://github.com/screenrig/plugin.git",
            "grok plugin install screenrig --trust",
            "--trust",
            "GROK_PLUGIN_ROOT",
            "claude plugin list --json",
            "codex plugin list --json",
            "Node.js 20.11 or newer",
            "authorizes adding",
            "$XDG_CONFIG_HOME/screenrig/config.json",
            "%APPDATA%\\screenrig\\config.json",
            "I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.",
            "https://screenrig.ai/pricing/",
            "payment_required",
            "error.status === 402",
            "Standard is prepaid",
            "Free to use within reason until 1 January 2027",
            "Image generation is metered separately",
            "The Player web app (PWA) is available today",
            "product direction, not public downloads",
            "You supply the content, screen devices, and network",
            "as the whole page",
            "Do not generate atmosphere-only stills",
            "Do not compose a presentable poster",
            "$10 / 1M text input",
            "$16 / 1M image input",
            "$60 / 1M image output",
            "not a fixed per-image price",
            "slide-deck-like",
            "Treat usage as free until 1 Jan 2027",
            "Do not invent a billing flow",
            "Do not shut anyone off for empty credit or remaining = 0",
            "Do not refuse compose, publish, or assign",
            "compose catalog",
            "compose render",
            "screen assign",
            "SCREENRIG_FFMPEG",
            "SCREENRIG_FFPROBE",
            "--no-transcode",
            "--codec hevc",
            "H.264 MP4 by default",
            "fails `media upload` alone",
            "globally installed command",
            "screenrig-plugin-freshness --json",
            "https://raw.githubusercontent.com/screenrig/plugin/main/.claude-plugin/marketplace.json",
            "plugins[0].version",
            "Codex marketplace entries stay version-free",
            "data.action === \"keep\"",
            "data.action === \"refresh\"",
            "data.action === \"continue_installed\"",
            "versions match. Do not reinstall",
            "published version could not be read",
            "claude plugin update screenrig@screenrig --scope user",
            "grok plugin update screenrig",
            "codex plugin marketplace upgrade --json",
            "Skill text and the bundled CLI travel together",
            "Do not PATH-swap in a local checkout",
            "Do not `npm i -g screenrig`",
        ],
    }
    for relative, facts in required_marketplace.items():
        text = re.sub(r"\s+", " ", (ROOT / relative).read_text(encoding="utf-8"))
        for fact in facts:
            if fact not in text:
                errors.append(f"{relative}: required marketplace fact missing: {fact}")
    skill_source = ROOT / "skills/screenrig/SKILL.md"
    skill_raw = skill_source.read_text(encoding="utf-8") if skill_source.is_file() else ""
    if "request ID for support" in skill_raw:
        errors.append("skills/screenrig/SKILL.md: nonexistent support recovery path remains")
    if "New skill text does not upgrade its executable" in skill_raw:
        errors.append("skills/screenrig/SKILL.md: obsolete skill-text-does-not-upgrade rule remains")

    readme_forbidden = {
        "credential-flow prose": re.compile(r"\benroll(?:s|ed|ing|ment)?\b", re.IGNORECASE),
        "pairing prose": re.compile(r"\bpair(?:s|ed|ing)?\b|\bABC-?234\b", re.IGNORECASE),
        "unsupported server surface": re.compile(r"\bMCP\b"),
        "global npm install": re.compile(r"npm install --global screenrig", re.IGNORECASE),
        "unshipped framing": re.compile(r"\bcoming soon\b|\broadmap\b|\bbeta\b", re.IGNORECASE),
    }
    for readme in (ROOT / "README.md", PLUGIN / "README.md"):
        if not readme.is_file():
            continue
        readme_text = readme.read_text(encoding="utf-8")
        for label, pattern in readme_forbidden.items():
            if pattern.search(readme_text):
                errors.append(f"{readme.relative_to(ROOT)}: {label} must not appear in the README")
        if "https://screenrig.ai/skill/SKILL.md" in readme_text:
            errors.append(f"{readme.relative_to(ROOT)}: site skill URL is not the agent contract")
    forbidden = {
        "account create": re.compile(r"\baccount create\b", re.IGNORECASE),
        "automatic enrollment": re.compile(
            r"enrolls? automatically|automatic (?:first-use )?enrollment|automatic enrollment path"
            r"|enrolls on first use|first authenticated (?:command|use|operation) enrolls"
            r"|first-use enrollment",
            re.IGNORECASE,
        ),
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
    # Do not teach `agent enroll`, `screen pair`, `agent connect`,
    # `agent disconnect`, `browser setup`, `screen provision`, `ABC-234`, or
    # `playlist templates` as a path. `agent status` stays. A "do not use"
    # mention of playlist templates is allowed; a Commands-list entry is not.
    skill_forbidden = {
        "agent enroll": re.compile(r"\bagent\s+enroll\b", re.IGNORECASE),
        "agent connect": re.compile(r"\bagent\s+connect\b", re.IGNORECASE),
        "agent disconnect": re.compile(r"\bagent\s+disconnect\b", re.IGNORECASE),
        "screen pair": re.compile(r"\bscreen\s+pair\b", re.IGNORECASE),
        "browser setup": re.compile(r"\bbrowser\s+setup\b", re.IGNORECASE),
        "screen provision": re.compile(r"\bscreen\s+provision\b", re.IGNORECASE),
        "ABC-234": re.compile(r"\bABC-?234\b", re.IGNORECASE),
        "screenrig-logd": re.compile(r"\bscreenrig-logd\b", re.IGNORECASE),
        "coming soon": re.compile(r"coming[- ]soon", re.IGNORECASE),
    }
    for root in audit_paths:
        if not root.is_file():
            errors.append(f"{display_path(root, cli_source)}: required stale-language audit file missing")
            continue
        text = root.read_text(encoding="utf-8")
        for label, pattern in forbidden.items():
            if pattern.search(text):
                errors.append(f"{display_path(root, cli_source)}: stale {label} language")
    skill_path = ROOT / "skills" / "screenrig" / "SKILL.md"
    skill_text = skill_path.read_text(encoding="utf-8") if skill_path.is_file() else ""
    for label, pattern in skill_forbidden.items():
        if pattern.search(skill_text):
            errors.append(f"skills/screenrig/SKILL.md: stale {label} language")
    commands_match = re.search(r"## Commands\s+```text\n(.*?)```", skill_text, re.S)
    commands_text = commands_match.group(1) if commands_match else ""
    if not commands_match:
        errors.append("skills/screenrig/SKILL.md: Commands list missing")
    else:
        for taught in (
            "agent enroll",
            "agent connect",
            "agent disconnect",
            "screen pair",
            "browser setup",
            "screen provision",
            "playlist templates",
        ):
            if re.search(rf"(?m)^{re.escape(taught)}\b", commands_text, re.IGNORECASE):
                errors.append(f"skills/screenrig/SKILL.md: Commands list must not teach {taught}")
        if "--preset signage-1080p30|signage-4k30" not in commands_text or "--no-audio" not in commands_text:
            errors.append("skills/screenrig/SKILL.md: Commands list missing media upload --preset / --no-audio")
        for taught in ("media generate", "media download"):
            if taught not in commands_text:
                errors.append(f"skills/screenrig/SKILL.md: Commands list missing {taught}")


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
