#!/usr/bin/env python3
"""Validate ScreenRig marketplace discovery and generated plugin boundaries."""

from __future__ import annotations

import argparse
import difflib
import importlib.util
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
# Every marketplace install clones this repository and copies plugins/screenrig,
# so both have a budget. Raising one is the operator's decision, not a fix.
BUDGET_REPO_FILES = 111
BUDGET_REPO_BYTES = 5_000_000
BUDGET_PLUGIN_FILES = 53
BUDGET_PLUGIN_BYTES = 3_000_000
BUDGET_FILE_BYTES = 2_097_152
_spec = importlib.util.spec_from_file_location("build_plugin", ROOT / "scripts" / "build-plugin.py")
assert _spec and _spec.loader
builder = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(builder)
PLUGIN_PLACEHOLDER = "0.1.2"
CLI_PLACEHOLDER = "0.1.0"
PRODUCT_VERSION = re.compile(r"^\d{2}\.(?:0[1-9]|1[0-2])\.[1-9]\d*$")


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
MCP_TOOLS_PATH = Path("scripts") / "mcp-tools.json"
MCP_TOOLS_SCHEMA = "screenrig.mcp-tools/v1"
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
        errors.append(".claude-plugin/marketplace.json: version must be 0.1.2 or YY.MM.N")
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
        PLUGIN / "openclaw.plugin.json",
        PLUGIN / "LICENSE",
        PLUGIN / "README.md",
        PLUGIN / "SECURITY.md",
        PLUGIN / "assets" / "logo.png",
    ]
    for path in required:
        if not path.is_file():
            errors.append(f"missing {path.relative_to(ROOT)}")
    for canonical_skill in (ROOT / "skills").iterdir():
        if canonical_skill.is_dir() and not (PLUGIN / "skills" / canonical_skill.name / "SKILL.md").is_file():
            errors.append(f"missing packaged skill: {canonical_skill.name}")
    dashboard_launcher = PLUGIN / "skills/screenrig-dashboard/scripts/screenrig-dashboard"
    if not dashboard_launcher.is_file() or not stat.S_IMODE(dashboard_launcher.stat().st_mode) & 0o111:
        errors.append("packaged dashboard launcher must exist and be executable")
    for executable in required[1:3]:
        if executable.is_file() and not stat.S_IMODE(executable.stat().st_mode) & 0o111:
            errors.append(f"{executable.relative_to(ROOT)}: must be executable")
    wrapper = required[1]
    if wrapper.is_file() and "../../../cli/dist/bin.js" not in wrapper.read_text(encoding="utf-8"):
        errors.append("plugin wrapper must resolve the CLI by package-relative path")
    if wrapper.is_file():
        wrapper_text = wrapper.read_text(encoding="utf-8")
        for fact in ("command -v node", "Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x)", "major > 26 || !!minimum && (minor > minimum[0] || minor === minimum[0] && patch >= minimum[1])"):
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
            "source checkout build cli/dist/bin.js",
        ):
            if fact not in canonical_text:
                errors.append(f"canonical launcher is missing resolve fact: {fact}")
        if "SCREENRIG_CLI" in canonical_text:
            errors.append("canonical launcher must not add a SCREENRIG_CLI override")
        if "walk_exec" in canonical_text or "pwd -P" in canonical_text:
            errors.append("canonical launcher must not search ancestor directories for a CLI")
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
            "not_installed",
            "GROK_PLUGIN_ROOT",
            "CLAUDE_PLUGIN_ROOT",
            "CODEX_PLUGIN_ROOT",
        ):
            if fact not in freshness_text:
                errors.append(f"canonical plugin-freshness helper is missing fact: {fact}")
        if "npm i -g" in freshness_text or "SCREENRIG_TOKEN" in freshness_text:
            errors.append("canonical plugin-freshness helper must not teach a global install or token")
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
                != "ScreenRig requires Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x); install or expose a compatible node runtime, then retry."
            ):
                errors.append("plugin wrapper missing-Node.js preflight is not deterministic")
    forbidden_packaged = [path for path in (PLUGIN / "cli" / "dist").rglob("*") if path.is_file() and ".test." in path.name]
    if forbidden_packaged:
        errors.append("packaged CLI contains test output")
    package = load(PLUGIN / "cli" / "package.json")
    if package.get("engines") != {"node": "^22.23.4 || ^24.22.1 || >=26.12.1"}:
        errors.append("bundled CLI must require Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x)")
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
    cli_files = sorted(path.relative_to(PLUGIN / "cli").as_posix() for path in (PLUGIN / "cli").rglob("*") if path.is_file())
    if cli_files != sorted(builder.CLI_FILES):
        errors.append(f"packaged CLI must be exactly {sorted(builder.CLI_FILES)}; found {cli_files}")
    try:
        builder.verify_cli_runtime_bundle(PLUGIN / "cli")
    except builder.BuildError as exc:
        errors.append(f"packaged CLI: {exc}")
    packaged_cli = PLUGIN / "cli" / "dist" / "bin.js"
    if packaged_cli.is_file():
        commands_text = packaged_cli.read_text(encoding="utf-8")
        for fact in ("agent disconnect --yes", "/api/agents/self/disconnect"):
            if fact not in commands_text:
                errors.append(f"packaged CLI credential lifecycle missing: {fact}")
        for stale in ("auth revoke --yes", "/api/v1/account/credential/revoke"):
            if stale in commands_text:
                errors.append(f"packaged CLI still teaches dropped auth alias: {stale}")


def tree_sizes(ref: str | None) -> dict[str, int] | None:
    """Sizes of what a commit of the working tree would hold (tracked and new, not ignored), or of ``ref``."""
    if ref is None:
        listed = subprocess.run(["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
                                cwd=ROOT, stdout=subprocess.PIPE, check=True).stdout.decode()
        return {name: (ROOT / name).stat().st_size for name in set(listed.split("\0")) if name and (ROOT / name).is_file()}
    tree = subprocess.run(["git", "ls-tree", "-r", "-l", "-z", ref], cwd=ROOT,
                          stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=False)
    if tree.returncode != 0:
        return None
    entries = (entry.split("\t", 1) for entry in tree.stdout.decode().split("\0") if entry)
    return {name: int(meta.split()[3]) for meta, name in entries if meta.split()[3] != "-"}


def check_budget() -> None:
    for label, ref in (("working tree", None), ("origin/main", "origin/main")):
        sizes = tree_sizes(ref)
        if sizes is None:
            continue
        plugin = {name: size for name, size in sizes.items() if name.startswith("plugins/screenrig/")}
        print(f"{label}: repository {len(sizes)} files, {sum(sizes.values()):,} bytes; "
              f"plugins/screenrig {len(plugin)} files, {sum(plugin.values()):,} bytes")
        if ref is not None:
            continue
        for what, value, budget in (
            ("repository files", len(sizes), BUDGET_REPO_FILES),
            ("repository bytes", sum(sizes.values()), BUDGET_REPO_BYTES),
            ("plugins/screenrig files", len(plugin), BUDGET_PLUGIN_FILES),
            ("plugins/screenrig bytes", sum(plugin.values()), BUDGET_PLUGIN_BYTES),
        ):
            if value > budget:
                errors.append(f"{what}: {value:,}, over the budget of {budget:,}")
        errors.extend(f"{name} is {size:,} bytes, over the {BUDGET_FILE_BYTES:,}-byte file budget"
                      for name, size in sorted(plugin.items()) if size > BUDGET_FILE_BYTES)
    print(f"budget: repository {BUDGET_REPO_FILES} files, {BUDGET_REPO_BYTES:,} bytes; plugins/screenrig "
          f"{BUDGET_PLUGIN_FILES} files, {BUDGET_PLUGIN_BYTES:,} bytes, {BUDGET_FILE_BYTES:,} bytes per file")


def check_no_alternate_surfaces(cli_source: Path | None) -> None:
    # Only the generated remote OAuth declarations are supported. Exact
    # matching rejects secret headers, executable adapters and private URLs.
    with tempfile.TemporaryDirectory(prefix="screenrig-manifests-") as temporary:
        expected = Path(temporary)
        builder.emit_manifests(expected, builder.METADATA, builder.version())
        for platform in ("claude", "codex"):
            relative = f".{platform}-plugin/plugin.json"
            actual = load(PLUGIN / relative).get("mcpServers")
            wanted = load(expected / relative)["mcpServers"]
            if actual != wanted:
                errors.append(f"{relative}: expected public remote MCP with host-managed OAuth only")
        for relative in (".mcp.json", "mcp.json", "plugin.json", "openclaw.plugin.json"):
            if load(PLUGIN / relative) != load(expected / relative):
                errors.append(f"{relative}: expected generated metadata and public remote MCP with host-managed OAuth only")
    for path in PLUGIN.rglob("*"):
        if path in (PLUGIN / ".mcp.json", PLUGIN / "mcp.json"):
            continue
        if path.is_file() and path.name in {".mcp.json", "mcp.json", "screenrig-mcp-auth.mjs"}:
            errors.append(f"{path.relative_to(ROOT)}: unexpected MCP declaration or retired credential helper")

    audit_paths = list((ROOT / "skills").rglob("*.md"))
    if cli_source is not None:
        audit_paths.extend(cli_source / relative for relative in CLI_SOURCE_FILES)
    required_marketplace = {
        "README.md": ["https://screenrig.ai/docs/start", "SECURITY.md", "Node.js 22.23.4"],
        "skills/screenrig/SKILL.md": ["screenrig version", "screenrig-plugin-freshness", "screenrig doctor",
            "not_enrolled", "agent enroll", "payment_required", "pending_review", "screenrig help --all",
            "screen list --state archived", "screen recover", "recovery_pending", "screen unarchive",
            "unarchive alone does not bring it back"],
        "skills/screenrig/references/installation.md": ["--trust", "marketplace add"],
    }
    for relative, facts in required_marketplace.items():
        text = re.sub(r"\s+", " ", (ROOT / relative).read_text(encoding="utf-8"))
        for fact in facts:
            if fact not in text:
                errors.append(f"{relative}: required operational fact missing: {fact}")
    for path in (ROOT / "skills").rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        for target in re.findall(r"\]\(([^)]+)\)", text):
            if "://" not in target and not target.startswith("#"):
                if not (path.parent / target.split("#")[0]).is_file():
                    errors.append(f"{path.relative_to(ROOT)}: missing reference {target}")
    skill_source = ROOT / "skills/screenrig/SKILL.md"
    skill_raw = skill_source.read_text(encoding="utf-8") if skill_source.is_file() else ""
    if "request ID for support" in skill_raw:
        errors.append("skills/screenrig/SKILL.md: nonexistent support recovery path remains")
    if "New skill text does not upgrade its executable" in skill_raw:
        errors.append("skills/screenrig/SKILL.md: obsolete skill-text-does-not-upgrade rule remains")

    readme_forbidden = {
        "token paste": re.compile(r"--token(?!-file\b)|SCREENRIG_TOKEN", re.IGNORECASE),
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
        "token paste": re.compile(r"--token(?!-file\b)|SCREENRIG_TOKEN", re.IGNORECASE),
        "retired screen creation": re.compile(r"\bscreen\s+create\b", re.IGNORECASE),
        "retired bootstrap onboarding": re.compile(
            r"#bootstrap=|/api/v1/screens/bootstrap|/api/screens/bootstrap|/runtime/v1/device-sessions/bootstrap|/screen/device-sessions/bootstrap|ScreenBootstrap|PlayerBootstrap|bootstrap grant",
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
    skill_forbidden = {
        "internal listener": re.compile(r"\bscreenrig-logd\b", re.IGNORECASE),
        "internal config": re.compile(r"config\.local-dev\.json", re.IGNORECASE),
    }
    for root in audit_paths:
        if not root.is_file():
            errors.append(f"{display_path(root, cli_source)}: required stale-language audit file missing")
            continue
        text = root.read_text(encoding="utf-8")
        for label, pattern in forbidden.items():
            if pattern.search(text):
                errors.append(f"{display_path(root, cli_source)}: stale {label} language")
    for skill_path in (ROOT / "skills").rglob("*.md"):
        skill_text = skill_path.read_text(encoding="utf-8")
        for label, pattern in skill_forbidden.items():
            if pattern.search(skill_text):
                errors.append(f"{skill_path.relative_to(ROOT)}: stale {label} language")
    skill_text = (ROOT / "skills/screenrig/SKILL.md").read_text(encoding="utf-8")
    for taught in ("media generate", "media download", "screen archive", "screen unarchive", "screen recover"):
        if taught not in skill_text:
            errors.append(f"skills/screenrig/SKILL.md: does not teach {taught}")


# A skill is read by an agent that then acts on it. A command or tool the product no
# longer has sends that agent into an error it cannot tell from its own mistake, so
# every command path and MCP tool name the skills write as code must exist: command
# paths in the bundled CLI's `help --all` inventory, tool names in the MCP tool list
# the backend publishes (scripts/mcp-tools.json, vendored by contracts.toml). These
# checks judge names only. They do not judge flags or arguments, prose, a path written
# without its group (`update|pause` after "campaign"), or a name outside code.
COMMAND_WORD = re.compile(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*")
MCP_TOOL = re.compile(r"(?<![\w./-])screenrig_[a-z0-9]+(?:_[a-z0-9]+)*(?![\w/-]|\.\w)")
CODE_SPAN = re.compile(r"(?<!`)(`+)(?!`)(.+?)(?<!`)\1(?!`)", re.DOTALL)
BLOCK_START = re.compile(r"\s{0,3}(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|\|)")
SHELL_FENCES = {"", "sh", "bash", "shell", "console", "zsh", "text"}


def code_regions(markdown: str) -> list[tuple[int, str, str]]:
    """``(line, text, kind)`` of every inline code span and fenced-block line.

    ``kind`` is ``span`` or the fence language. A span may wrap across lines, and a
    ``\\|`` inside a table cell reads as ``|``.
    """
    regions: list[tuple[int, str, str]] = []
    block: list[str] = []
    first = 1
    fence: tuple[str, int, str] | None = None

    def flush() -> None:
        text = "\n".join(block)
        block.clear()
        for match in CODE_SPAN.finditer(text):
            line = first + text.count("\n", 0, match.start())
            regions.append((line, " ".join(match.group(2).replace("\\|", "|").split()), "span"))

    for number, raw in enumerate(markdown.splitlines(), 1):
        stripped = raw.strip()
        if fence:
            if stripped and set(stripped) == {fence[0]} and len(stripped) >= fence[1]:
                fence = None
            else:
                regions.append((number, stripped, fence[2]))
            continue
        opening = re.match(r"\s*(`{3,}|~{3,})\s*([\w+-]*)\s*$", raw)
        if opening:
            flush()
            fence = (opening.group(1)[0], len(opening.group(1)), opening.group(2).lower())
            continue
        if not stripped or BLOCK_START.match(raw):
            flush()
        if stripped:
            if not block:
                first = number
            block.append(raw)
    flush()
    return regions


def command_tree(inventory: list[str]) -> dict[str, Any]:
    """Nested ``{word: children}`` from the CLI's leaf command paths; a leaf has no children."""
    tree: dict[str, Any] = {}
    for path in inventory:
        node = tree
        for word in path.split():
            node = node.setdefault(word, {})
    return tree


def unknown_command(words: list[str], tree: dict[str, Any]) -> str | None:
    """The first command word that the CLI does not have, or None.

    Words are followed while they are lowercase command names under a command group;
    the first flag, placeholder, quoted or numeric word, or any word under a leaf
    command (an argument), ends the path. ``a|b|c`` names sibling commands.
    """
    node: dict[str, Any] = tree
    walked: list[str] = []
    for word in words:
        if not node:
            break
        names = word.split("|")
        if not all(COMMAND_WORD.fullmatch(name) for name in names):
            break
        for name in names:
            if name not in node:
                close = difflib.get_close_matches(name, sorted(node), n=3)
                choices = f"did you mean {', '.join(close)}?" if close else f"it has {', '.join(sorted(node))}"
                return f"`{' '.join([*walked, name])}` is not a screenrig command; `{' '.join(['screenrig', *walked])}`: {choices}"
        if len(names) > 1:
            break
        node = node[word]
        walked.append(word)
    return None


def taught_command_errors(markdown: str, tree: dict[str, Any]) -> list[tuple[int, str]]:
    """Command paths written as ``screenrig ...`` (a span or a shell line) or, in a span, from a command group."""
    problems: list[tuple[int, str]] = []
    for line, text, kind in code_regions(markdown):
        if kind != "span" and kind not in SHELL_FENCES:
            continue
        words = text.removeprefix("$ ").split()
        if not words:
            continue
        if words[0] == "screenrig":
            words = words[1:]
        elif kind != "span" or words[0] not in tree:
            continue
        if words[:1] == ["help"]:
            words = words[1:]
        problem = unknown_command(words, tree)
        if problem:
            problems.append((line, problem))
    return problems


def taught_tool_errors(markdown: str, tools: set[str]) -> list[tuple[int, str]]:
    return [(line, f"names MCP tool `{match.group(0)}`, which the backend does not publish")
            for line, text, _kind in code_regions(markdown)
            for match in MCP_TOOL.finditer(text) if match.group(0) not in tools]


def bundled_command_inventory() -> list[str] | None:
    """Leaf command paths and aliases from the packaged CLI's own ``help --all``."""
    wrapper = PLUGIN / "skills" / "screenrig" / "scripts" / "screenrig"
    if not wrapper.is_file():
        return None
    with tempfile.TemporaryDirectory(prefix="screenrig-help-") as temporary:
        result = subprocess.run(
            [str(wrapper), "--json", "help", "--all"],
            cwd=ROOT,
            env={"PATH": os.environ.get("PATH", ""), "XDG_CONFIG_HOME": str(Path(temporary) / "config")},
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
    try:
        envelope = json.loads(result.stdout)
        inventory = envelope["data"]["allCommands"]
        valid = (result.returncode == 0 and envelope.get("ok") is True and isinstance(inventory, list)
                 and bool(inventory) and all(isinstance(item, str) for item in inventory))
    except (json.JSONDecodeError, KeyError, TypeError):
        valid = False
    if not valid:
        errors.append("bundled CLI help --all did not return a command inventory; taught commands were not checked")
        return None
    return inventory


def published_mcp_tools() -> set[str] | None:
    """Tool names in the vendored backend list, or None when it is missing or malformed."""
    name = MCP_TOOLS_PATH.as_posix()
    try:
        document = json.loads((ROOT / MCP_TOOLS_PATH).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{name} is unreadable ({exc}); contracts.toml vendors it from the backend's api/public/mcp-tools.json")
        return None
    tools = document.get("tools") if isinstance(document, dict) else None
    if (document.get("schema") != MCP_TOOLS_SCHEMA or not isinstance(tools, list) or not tools
            or not all(isinstance(tool, str) and re.fullmatch(r"screenrig_[a-z0-9_]+", tool) for tool in tools)):
        errors.append(f"{name} is not a {MCP_TOOLS_SCHEMA} document of screenrig_ tool names")
        return None
    return set(tools)


def check_taught_surface() -> None:
    documents = sorted((ROOT / "skills").rglob("*.md"))
    inventory = bundled_command_inventory()
    tree = command_tree(inventory) if inventory else None
    tools = published_mcp_tools()
    for path in documents:
        text = path.read_text(encoding="utf-8")
        found = taught_command_errors(text, tree) if tree else []
        if tools is not None:
            found.extend(taught_tool_errors(text, tools))
        errors.extend(f"{path.relative_to(ROOT)}:{line}: {problem}" for line, problem in sorted(found))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cli-artifact")
    parser.add_argument("--cli-source")
    parser.add_argument("--budget", action="store_true", help="only count files and bytes against the budget")
    args = parser.parse_args()
    if args.budget:
        check_budget()
        sys.stdout.flush()
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        print("ScreenRig plugin budget failed" if errors else "ScreenRig plugin budget passed")
        return 1 if errors else 0
    command = [sys.executable, str(ROOT / "scripts" / "build-plugin.py"), "--check"]
    if args.cli_artifact:
        command.extend(["--cli-artifact", args.cli_artifact])
    build = subprocess.run(command, cwd=ROOT)
    if build.returncode != 0:
        errors.append("generated plugin build check failed")
    check_marketplaces()
    check_package()
    check_budget()
    check_no_alternate_surfaces(require_cli_source(args.cli_source))
    check_taught_surface()
    if errors:
        print("ScreenRig plugin validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("ScreenRig plugin validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
