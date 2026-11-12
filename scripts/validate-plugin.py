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
AGENTS_PLUGIN = ROOT / "plugins" / "screenrig-agents"
DIRECTORY_PLUGIN = ROOT / "plugins" / "screenrig-directory"
PLUGIN_REPOSITORY = "https://github.com/screenrig/plugin"
CLI_REPOSITORY = "git+https://github.com/screenrig/cli.git"
# Every marketplace install clones this repository and copies one plugin folder
# (plugins/screenrig for Claude, plugins/screenrig-agents for Codex, Grok and
# OpenClaw), so the repository and each folder have a budget. Raising one is the
# operator's decision, not a fix. The repository budget holds both folders.
BUDGET_REPO_FILES = 280
BUDGET_REPO_BYTES = 10_000_000
BUDGET_PLUGIN_FILES = 120
BUDGET_PLUGIN_BYTES = 5_000_000
BUDGET_FILE_BYTES = 2_097_152
# The Claude plugin directory reads at most this much of a script or document and
# holds anything larger for review; images it checks as images.
DIRECTORY_READ_BYTES = 262_144
DIRECTORY_IMAGE_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".webp")
# The Claude folder is scanned by the plugin directory, which holds any image a
# command, hook or script can reach, and any font: it carries neither, and no
# manifest names one.
CLAUDE_FORBIDDEN_SUFFIXES = DIRECTORY_IMAGE_SUFFIXES + (".ico", ".svg", ".bmp", ".tif", ".tiff", ".avif",
                                                         ".woff", ".woff2", ".ttf", ".otf", ".eot")
# Manifests only the agents folder carries; the Claude folder has .claude-plugin/plugin.json alone.
AGENTS_MANIFESTS = ("plugin.json", "mcp.json", ".mcp.json", "openclaw.plugin.json", ".codex-plugin/plugin.json")
_spec = importlib.util.spec_from_file_location("build_plugin", ROOT / "scripts" / "build-plugin.py")
assert _spec and _spec.loader
builder = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(builder)
PRODUCT_VERSION = re.compile(r"^\d{2}\.(?:0[1-9]|1[0-2])\.[1-9]\d*$")
MCP_TOOLS_PATH = Path("scripts") / "mcp-tools.json"
MCP_TOOLS_SCHEMA = "screenrig.mcp-tools/v1"
errors: list[str] = []


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
    # Codex reads .agents/plugins/marketplace.json, which points at the agents
    # folder. Claude and Grok read .claude-plugin/marketplace.json and install the
    # Claude folder: Grok loads its skills and inline mcpServers, and a Grok index
    # of its own would strand installs registered under plugins/screenrig.
    codex = load(ROOT / ".agents" / "plugins" / "marketplace.json")
    entries = codex.get("plugins") or []
    if len(entries) != 1 or not isinstance(entries[0], dict):
        errors.append(".agents/plugins/marketplace.json: expected one plugin")
    else:
        entry = entries[0]
        source = entry.get("source") or {}
        policy = entry.get("policy") or {}
        if entry.get("name") != "screenrig" or source.get("path") != "./plugins/screenrig-agents":
            errors.append(".agents/plugins/marketplace.json: invalid ScreenRig source")
        if policy != {"installation": "AVAILABLE", "authentication": "ON_USE"}:
            errors.append(".agents/plugins/marketplace.json: expected AVAILABLE/ON_USE policy")
        if "version" in entry:
            errors.append(".agents/plugins/marketplace.json: Codex entry must be version-free")

    if (ROOT / ".grok-plugin").exists():
        errors.append(".grok-plugin/ must not exist: Grok installs the Claude folder through .claude-plugin/marketplace.json")

    claude = load(ROOT / ".claude-plugin" / "marketplace.json")
    claude_entries = claude.get("plugins") or []
    if len(claude_entries) != 1 or not isinstance(claude_entries[0], dict):
        errors.append(".claude-plugin/marketplace.json: expected one plugin")
        return
    entry = claude_entries[0]
    if entry.get("name") != "screenrig" or entry.get("source") != "./plugins/screenrig":
        errors.append(".claude-plugin/marketplace.json: invalid ScreenRig source")
    version = entry.get("version")
    if not (isinstance(version, str) and PRODUCT_VERSION.fullmatch(version)):
        errors.append(".claude-plugin/marketplace.json: version must be YY.MM.N")
    if entry.get("repository") != PLUGIN_REPOSITORY or entry.get("license") != "Apache-2.0":
        errors.append(".claude-plugin/marketplace.json: public repository/license metadata drift")
    for folder, relative in ((PLUGIN, ".claude-plugin/plugin.json"), (AGENTS_PLUGIN, ".codex-plugin/plugin.json")):
        label = f"{folder.relative_to(ROOT)}/{relative}"
        manifest = load(folder / relative)
        if manifest.get("name") != "screenrig" or manifest.get("version") != version:
            errors.append(f"{label}: name/version drift")
        if manifest.get("repository") != PLUGIN_REPOSITORY or manifest.get("license") != "Apache-2.0":
            errors.append(f"{label}: public repository/license drift")


def check_claude_folder_boundary() -> None:
    """plugins/screenrig holds no image or font but the unreferenced listing icon
    (.claude-plugin/icon.png), and no manifest but .claude-plugin/plugin.json."""
    for path in sorted(PLUGIN.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(PLUGIN).as_posix()
        if path.suffix.lower() in CLAUDE_FORBIDDEN_SUFFIXES and relative != ".claude-plugin/icon.png":
            errors.append(f"{path.relative_to(ROOT)}: the Claude folder holds no image or font file")
        if relative in AGENTS_MANIFESTS:
            errors.append(f"{path.relative_to(ROOT)}: manifests of other hosts belong in plugins/screenrig-agents")
    manifest_text = (PLUGIN / ".claude-plugin" / "plugin.json").read_text(encoding="utf-8") \
        if (PLUGIN / ".claude-plugin" / "plugin.json").is_file() else ""
    if "icon" in load(PLUGIN / ".claude-plugin" / "plugin.json"):
        errors.append("plugins/screenrig/.claude-plugin/plugin.json: must not name an icon")
    for reference in re.findall(r'"([^"]+)"', manifest_text):
        if not reference.startswith(("http://", "https://")) and reference.lower().endswith(CLAUDE_FORBIDDEN_SUFFIXES):
            errors.append(f"plugins/screenrig/.claude-plugin/plugin.json: names an image or font: {reference}")


# The Claude plugin directory takes scripts, programs and fields outside its lists
# only from organizations Anthropic has Verified. The folder submitted to it holds
# Markdown, text, JSON, YAML and PNG, JPEG, GIF, WebP or ICO images, none starting
# with #!, no package manager file, and only the manifest and MCP fields below.
DIRECTORY_TEXT_SUFFIXES = (".md", ".txt", ".json", ".yaml", ".yml")
DIRECTORY_ALLOWED_SUFFIXES = DIRECTORY_TEXT_SUFFIXES + DIRECTORY_IMAGE_SUFFIXES + (".ico",)
DIRECTORY_ALLOWED_NAMES = ("LICENSE", "README", ".gitignore")
DIRECTORY_PACKAGE_FILES = re.compile(
    r"^(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-(?:workspace|lock)\.yaml|\.npmrc|\.yarnrc(?:\.yml)?|yarn\.lock"
    r"|bun\.lockb?|bunfig\.toml|uv\.(?:toml|lock)|pyproject\.toml|requirements.*\.txt|Pipfile.*|Cargo\.(?:toml|lock)|go\.(?:mod|sum))$")
DIRECTORY_MANIFEST_FIELDS = {
    "name", "version", "description", "author", "homepage", "repository", "license", "keywords",
    "displayName", "privacyPolicyUrl", "termsOfServiceUrl", "supportUrl", "documentationUrl", "screenshots"}
DIRECTORY_MCP_FIELDS = {"type", "url", "headers", "timeout", "alwaysLoad", "oauth", "name", "title", "displayName", "description"}
DIRECTORY_OAUTH_FIELDS = {"clientId", "callbackPort", "authServerMetadataUrl", "scopes"}
DIRECTORY_SKILL_FIELDS = {"name", "description"}


def check_directory_folder() -> None:
    label = DIRECTORY_PLUGIN.relative_to(ROOT).as_posix()
    for relative in (".claude-plugin/plugin.json", ".claude-plugin/icon.png", ".mcp.json", "LICENSE", "README.md",
                     "skills/screenrig/SKILL.md"):
        if not (DIRECTORY_PLUGIN / relative).is_file():
            errors.append(f"missing {label}/{relative}")
    for path in sorted(DIRECTORY_PLUGIN.rglob("*")):
        if path.is_symlink():
            errors.append(f"{path.relative_to(ROOT)}: the directory folder holds regular files only")
        if not path.is_file():
            continue
        name = path.relative_to(ROOT).as_posix()
        if path.suffix.lower() not in DIRECTORY_ALLOWED_SUFFIXES and path.name not in DIRECTORY_ALLOWED_NAMES:
            errors.append(f"{name}: the Claude plugin directory accepts only Markdown, text, JSON, YAML and images from this organization")
        if DIRECTORY_PACKAGE_FILES.fullmatch(path.name):
            errors.append(f"{name}: the Claude plugin directory refuses package manager files")
        if stat.S_IMODE(path.stat().st_mode) & 0o111:
            errors.append(f"{name}: must not be executable")
        data = path.read_bytes()
        if data.startswith(b"#!"):
            errors.append(f"{name}: starts with #!, which the Claude plugin directory reads as a program")
        if path.suffix.lower() in DIRECTORY_IMAGE_SUFFIXES + (".ico",):
            continue
        if len(data) > DIRECTORY_READ_BYTES:
            errors.append(f"{name}: over the {DIRECTORY_READ_BYTES:,} bytes the Claude plugin directory reads")
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            errors.append(f"{name}: must be UTF-8 text")
            continue
        if "\0" in text:
            errors.append(f"{name}: must hold no NUL byte")
        for offset, kind, sample in folder_scan_findings(text):
            errors.append(f"{name}:{text.count(chr(10), 0, offset) + 1}: {kind} ({sample!r}) reads as a credential read "
                          "to the Claude plugin directory scan; reword")
        if path.suffix == ".md":
            for kind, pattern in SCANNER_PATTERNS.items():
                match = pattern.search(text)
                if match:
                    errors.append(f"{name}:{text.count(chr(10), 0, match.start()) + 1}: {kind} ({match.group(0)!r}) is "
                                  "read as a credential or download-and-execute by the Claude plugin directory scan; reword")
            if re.search(r"\b(?:npm|pnpm|yarn|bun|pip|pipx|uv|npx|uvx|bunx|brew|cargo)\s+(?:i|install|add|config|dlx|run|x)\b", text):
                errors.append(f"{name}: names a package manager command; link to the documentation instead")
    manifest = load(DIRECTORY_PLUGIN / ".claude-plugin" / "plugin.json")
    extra = sorted(set(manifest) - DIRECTORY_MANIFEST_FIELDS)
    if extra:
        errors.append(f"{label}/.claude-plugin/plugin.json: fields outside the directory's list: {', '.join(extra)}")
    claude = load(PLUGIN / ".claude-plugin" / "plugin.json")
    if manifest != {key: value for key, value in claude.items() if key != "mcpServers"}:
        errors.append(f"{label}/.claude-plugin/plugin.json: differs from the Claude folder's manifest beyond mcpServers")
    servers = load(DIRECTORY_PLUGIN / ".mcp.json").get("mcpServers")
    if servers != claude.get("mcpServers"):
        errors.append(f"{label}/.mcp.json: expected the Claude folder's public remote MCP with host-managed OAuth only")
    for server in (servers or {}).values() if isinstance(servers, dict) else ():
        if set(server) - DIRECTORY_MCP_FIELDS or set(server.get("oauth") or {}) - DIRECTORY_OAUTH_FIELDS:
            errors.append(f"{label}/.mcp.json: fields outside the directory's list")
    skill_path = DIRECTORY_PLUGIN / "skills" / "screenrig" / "SKILL.md"
    if not skill_path.is_file():
        return
    skill = skill_path.read_text(encoding="utf-8")
    canonical = (ROOT / "skills" / "screenrig" / "SKILL.md").read_text(encoding="utf-8")
    front_matter = re.match(r"---\n(.*?)\n---\n", skill, re.DOTALL)
    if front_matter is None or front_matter.group(0) != (re.match(r"---\n.*?\n---\n", canonical, re.DOTALL) or [""])[0]:
        errors.append(f"{label}/skills/screenrig/SKILL.md: front matter differs from the canonical skill")
    elif {line.split(":", 1)[0] for line in front_matter.group(1).splitlines() if line[:1].isalpha()} - DIRECTORY_SKILL_FIELDS:
        errors.append(f"{label}/skills/screenrig/SKILL.md: front matter takes name and description only")
    tools = published_mcp_tools()
    if tools is not None:
        errors.extend(f"{label}/skills/screenrig/SKILL.md:{line}: {problem}" for line, problem in taught_tool_errors(skill, tools))
    for fact in ("screenrig_screen_pair", "screenrig_playlist_create", "screenrig_screen_screenshot", "screenrig_docs_search",
                 "https://github.com/screenrig/plugin", "do not download, install or run it yourself"):
        if fact not in skill:
            errors.append(f"{label}/skills/screenrig/SKILL.md: required fact missing: {fact}")
    readme = (DIRECTORY_PLUGIN / "README.md").read_text(encoding="utf-8") if (DIRECTORY_PLUGIN / "README.md").is_file() else ""
    prose = re.sub(r"```.*?```", "", readme, flags=re.DOTALL)
    if len(prose.split()) < 40 or "https://github.com/screenrig/plugin" not in readme or "api.screenrig.ai" not in readme:
        errors.append(f"{label}/README.md: needs 40 words outside code, the connector's host and the full plugin's address")


def check_package() -> None:
    required = [
        PLUGIN / "skills" / "screenrig" / "SKILL.md",
        PLUGIN / "skills" / "screenrig" / "scripts" / "screenrig",
        PLUGIN / "cli" / "dist" / "bin.js",
        PLUGIN / "cli" / "package.json",
        PLUGIN / ".claude-plugin" / "plugin.json",
        PLUGIN / "LICENSE",
        PLUGIN / "README.md",
        PLUGIN / "SECURITY.md",
    ]
    for path in required:
        if not path.is_file():
            errors.append(f"missing {path.relative_to(ROOT)}")
    for canonical_skill in (ROOT / "skills").iterdir():
        if canonical_skill.is_dir() and not (PLUGIN / "skills" / canonical_skill.name / "SKILL.md").is_file():
            errors.append(f"missing packaged skill: {canonical_skill.name}")
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
                != "screenRIG requires Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x); install or expose a compatible node runtime, then retry."
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
        not (isinstance(package.get("version"), str) and PRODUCT_VERSION.fullmatch(package["version"]))
        or package.get("private") is not False
        or package.get("license") != "Apache-2.0"
        or not isinstance(repository, dict)
        or repository.get("url") != CLI_REPOSITORY
    ):
        errors.append("packaged CLI public release metadata drift")
    cli_files = sorted(path.relative_to(PLUGIN / "cli").as_posix() for path in (PLUGIN / "cli").rglob("*") if path.is_file())
    errors.extend(f"packaged CLI: {error}" for error in builder.cli_layout_errors(cli_files))
    try:
        builder.verify_cli_runtime_bundle(PLUGIN / "cli")
    except builder.BuildError as exc:
        errors.append(f"packaged CLI: {exc}")
    packaged_cli = sorted((PLUGIN / "cli" / "dist").glob("*.js"))
    if packaged_cli:
        commands_text = "\n".join(path.read_text(encoding="utf-8") for path in packaged_cli)
        for fact in ("agent disconnect --yes", "/api/agents/self/disconnect"):
            if fact not in commands_text:
                errors.append(f"packaged CLI credential lifecycle missing: {fact}")


def check_agents_package() -> None:
    """plugins/screenrig-agents: the folder Codex, Grok and OpenClaw install."""
    required = [
        AGENTS_PLUGIN / "skills" / "screenrig" / "SKILL.md",
        AGENTS_PLUGIN / "skills" / "screenrig" / "scripts" / "screenrig",
        AGENTS_PLUGIN / "skills" / "screenrig" / "scripts" / "screenrig-plugin-freshness",
        AGENTS_PLUGIN / "cli" / "dist" / "bin.js",
        AGENTS_PLUGIN / "cli" / "package.json",
        AGENTS_PLUGIN / "LICENSE",
        AGENTS_PLUGIN / "README.md",
        AGENTS_PLUGIN / "SECURITY.md",
        AGENTS_PLUGIN / "assets" / "logo.png",
        *(AGENTS_PLUGIN / manifest for manifest in AGENTS_MANIFESTS),
    ]
    for path in required:
        if not path.is_file():
            errors.append(f"missing {path.relative_to(ROOT)}")
    for executable in required[1:4]:
        if executable.is_file() and not stat.S_IMODE(executable.stat().st_mode) & 0o111:
            errors.append(f"{executable.relative_to(ROOT)}: must be executable")
    if (AGENTS_PLUGIN / ".claude-plugin").exists():
        errors.append("plugins/screenrig-agents/.claude-plugin: Claude reads plugins/screenrig")
    for canonical_skill in (ROOT / "skills").iterdir():
        if canonical_skill.is_dir() and not (AGENTS_PLUGIN / "skills" / canonical_skill.name / "SKILL.md").is_file():
            errors.append(f"missing packaged skill in plugins/screenrig-agents: {canonical_skill.name}")
    package = load(AGENTS_PLUGIN / "cli" / "package.json")
    if package.get("version") != load(PLUGIN / "cli" / "package.json").get("version"):
        errors.append("plugins/screenrig-agents/cli/package.json: version differs from plugins/screenrig")
    agents_files = sorted(path.relative_to(AGENTS_PLUGIN / "cli").as_posix()
                          for path in (AGENTS_PLUGIN / "cli").rglob("*") if path.is_file())
    errors.extend(f"packaged agents CLI: {error}" for error in builder.cli_layout_errors(agents_files))
    wrapper = AGENTS_PLUGIN / "skills" / "screenrig" / "scripts" / "screenrig"
    if wrapper.is_file():
        with tempfile.TemporaryDirectory(prefix="screenrig-plugin-config-") as temporary:
            result = subprocess.run(
                [str(wrapper), "--json", "version"],
                cwd=ROOT,
                env={"PATH": os.environ.get("PATH", ""), "XDG_CONFIG_HOME": str(Path(temporary) / "config")},
                text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
            )
        try:
            envelope = json.loads(result.stdout)
        except json.JSONDecodeError:
            envelope = {}
        data = envelope.get("data") or {}
        if (result.returncode != 0 or envelope.get("ok") is not True or not isinstance(data, dict)
                or data.get("version") != package.get("version") or result.stderr):
            errors.append("plugins/screenrig-agents skill wrapper did not execute the bundled CLI with clean JSON output")


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
    folders = ("plugins/screenrig/", "plugins/screenrig-agents/", "plugins/screenrig-directory/")
    for label, ref in (("working tree", None), ("origin/main", "origin/main")):
        sizes = tree_sizes(ref)
        if sizes is None:
            continue
        per_folder = {folder: {name: size for name, size in sizes.items() if name.startswith(folder)} for folder in folders}
        print(f"{label}: repository {len(sizes)} files, {sum(sizes.values()):,} bytes; " + "; ".join(
            f"{folder.rstrip('/')} {len(found)} files, {sum(found.values()):,} bytes" for folder, found in per_folder.items()))
        if ref is not None:
            continue
        for what, value, budget in (
            ("repository files", len(sizes), BUDGET_REPO_FILES),
            ("repository bytes", sum(sizes.values()), BUDGET_REPO_BYTES),
        ):
            if value > budget:
                errors.append(f"{what}: {value:,}, over the budget of {budget:,}")
        for folder, found in per_folder.items():
            for what, value, budget in (
                (f"{folder.rstrip('/')} files", len(found), BUDGET_PLUGIN_FILES),
                (f"{folder.rstrip('/')} bytes", sum(found.values()), BUDGET_PLUGIN_BYTES),
            ):
                if value > budget:
                    errors.append(f"{what}: {value:,}, over the budget of {budget:,}")
            errors.extend(f"{name} is {size:,} bytes, over the {BUDGET_FILE_BYTES:,}-byte file budget"
                          for name, size in sorted(found.items()) if size > BUDGET_FILE_BYTES)
            errors.extend(f"{name} is {size:,} bytes; the Claude plugin directory reads only {DIRECTORY_READ_BYTES:,} "
                          "bytes of a file and holds the plugin for review"
                          for name, size in sorted(found.items())
                          if size > DIRECTORY_READ_BYTES and not name.lower().endswith(DIRECTORY_IMAGE_SUFFIXES))
    print(f"budget: repository {BUDGET_REPO_FILES} files, {BUDGET_REPO_BYTES:,} bytes; each plugin folder "
          f"{BUDGET_PLUGIN_FILES} files, {BUDGET_PLUGIN_BYTES:,} bytes, {BUDGET_FILE_BYTES:,} bytes per file")


def check_no_alternate_surfaces() -> None:
    # Only the generated remote OAuth declarations are supported. Exact
    # matching rejects secret headers, executable adapters and private URLs.
    with tempfile.TemporaryDirectory(prefix="screenrig-manifests-") as temporary:
        expected = Path(temporary)
        builder.emit_manifests(expected, builder.METADATA, builder.version())
        for folder, name, relative in ((PLUGIN, "claude", ".claude-plugin/plugin.json"),
                                       (AGENTS_PLUGIN, "codex", ".codex-plugin/plugin.json")):
            expected_folder = expected / folder.name
            actual = load(folder / relative).get("mcpServers")
            wanted = load(expected_folder / relative)["mcpServers"]
            if actual != wanted:
                errors.append(f"{folder.name}/{relative}: expected public remote MCP with host-managed OAuth only")
        for relative in (".mcp.json", "mcp.json", "plugin.json", "openclaw.plugin.json"):
            if load(AGENTS_PLUGIN / relative) != load(expected / AGENTS_PLUGIN.name / relative):
                errors.append(f"{AGENTS_PLUGIN.name}/{relative}: expected generated metadata and public remote MCP with host-managed OAuth only")
    # Only the agents folder carries MCP declaration files, and only at its root.
    for folder in (PLUGIN, AGENTS_PLUGIN):
        for path in folder.rglob("*"):
            if folder == AGENTS_PLUGIN and path in (AGENTS_PLUGIN / ".mcp.json", AGENTS_PLUGIN / "mcp.json"):
                continue
            if path.is_file() and path.name in {".mcp.json", "mcp.json"}:
                errors.append(f"{path.relative_to(ROOT)}: unexpected MCP declaration")
    for path in DIRECTORY_PLUGIN.rglob("*"):
        if path.is_file() and path.name in {".mcp.json", "mcp.json"} and path != DIRECTORY_PLUGIN / ".mcp.json":
            errors.append(f"{path.relative_to(ROOT)}: unexpected MCP declaration")

    required_marketplace = {
        "README.md": ["https://screenrig.ai/docs/start", "SECURITY.md", "Node.js 22.23.4"],
        "skills/screenrig/SKILL.md": ["screenrig version", "screenrig-plugin-freshness", "screenrig doctor",
            "not_enrolled", "agent enroll", "rate_limited", "quota_exceeded", "pending_review", "screenrig help --all",
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

    token_paste = {
        "token paste": re.compile(r"--token(?!-file\b)|SCREENRIG_TOKEN", re.IGNORECASE),
    }
    for readme in (ROOT / "README.md", PLUGIN / "README.md"):
        if not readme.is_file():
            continue
        readme_text = readme.read_text(encoding="utf-8")
        for label, pattern in token_paste.items():
            if pattern.search(readme_text):
                errors.append(f"{readme.relative_to(ROOT)}: {label} must not appear in the README")
        if "https://screenrig.ai/skill/SKILL.md" in readme_text:
            errors.append(f"{readme.relative_to(ROOT)}: site skill URL is not the agent contract")
    skill_forbidden = {
        "internal listener": re.compile(r"\bscreenrig-logd\b", re.IGNORECASE),
        "internal config": re.compile(r"config\.local-dev\.json", re.IGNORECASE),
    }
    for path in (ROOT / "skills").rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        for label, pattern in token_paste.items():
            if pattern.search(text):
                errors.append(f"{path.relative_to(ROOT)}: stale {label} language")
    for skill_path in (ROOT / "skills").rglob("*.md"):
        skill_text = skill_path.read_text(encoding="utf-8")
        for label, pattern in skill_forbidden.items():
            if pattern.search(skill_text):
                errors.append(f"{skill_path.relative_to(ROOT)}: stale {label} language")
    skill_text = (ROOT / "skills/screenrig/SKILL.md").read_text(encoding="utf-8")
    for taught in ("media upload-batch", "billing usage", "screen archive", "screen unarchive", "screen recover"):
        if taught not in skill_text:
            errors.append(f"skills/screenrig/SKILL.md: does not teach {taught}")
    # The product has no image generation, usage credit or metered requests.
    retired = re.compile(
        r"media generate|screenrig_media_generate|usage credit|billed (?:API )?(?:request|event|route)|payment_required"
        r"|\bcredits\b(?!_)|credit balance|prepaid balance|\bwallet\b",
        re.IGNORECASE)
    for path in (ROOT / "skills").rglob("*"):
        if path.is_file() and path.suffix in {".md", ".yaml"}:
            match = retired.search(path.read_text(encoding="utf-8"))
            if match:
                errors.append(f"{path.relative_to(ROOT)}: retired phrase: {match.group(0)}")


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


# The Claude plugin directory scan reads these as a credential taken from the
# environment or as download-and-execute: the whole environment passed, copied or
# iterated, a dynamic environment read, a bearer header example, a credential
# variable, a piped download, printenv, and "pass" (the pass password manager).
SCANNER_PATTERNS = {
    "whole or dynamic environment read": re.compile(r"process\.env\[|\.\.\.process\.env|env:\s*process\.env|=\s*process\.env\s*[;,)]|\(process\.env[,)]"),
    "bearer header example": re.compile(r"Authorization:\s*Bearer", re.IGNORECASE),
    "credential environment variable": re.compile(
        r"\$\{?[A-Z][A-Z0-9_]*(?:TOKEN|SECRET|API_KEY|PASSWORD)\b|\bexport\s+[A-Z][A-Z0-9_]*(?:TOKEN|SECRET|KEY)\b"
        r"|SCREENRIG_CLIENT_(?:ID|SECRET|KEY_FILE)\b"),
    "download and execute": re.compile(r"\bcurl\b|\bwget\b|\|\s*(?:ba|z)?sh\b|\$\(\s*curl"),
    "environment dump": re.compile(r"\bprintenv\b"),
    "pass password manager": re.compile(r"\b[Pp]ass(?:es)?\b"),
}


def check_scanner_patterns() -> None:
    paths = [path for path in sorted((ROOT / "skills").rglob("*")) if path.is_file()]
    paths.extend(path for path in (ROOT / "README.md", ROOT / "SECURITY.md") if path.is_file())
    for path in paths:
        text = path.read_text(encoding="utf-8")
        for label, pattern in SCANNER_PATTERNS.items():
            match = pattern.search(text)
            if match:
                line = text.count("\n", 0, match.start()) + 1
                errors.append(f"{path.relative_to(ROOT)}:{line}: {label} ({match.group(0)!r}) is read as a credential "
                              "or download-and-execute by the Claude plugin directory scan; reword")


# The same scan reads every text file of the Claude folder, the bundled CLI
# included, like shell (cli scripts/directory-scan.mjs keeps the CLI bundle
# clean; this is the plugin's own gate): a ${...} or $NAME expansion naming a
# credential, a bare set, env, printenv or export starting a command, pass
# starting a command, whole-environment access, a well-known credential file, or
# a piped download. One such spot beside a URL holds the plugin for review.
FOLDER_CREDENTIAL_NAME = re.compile(r"(key|secret|token|bearer|passw|pwd|credential|authorization|cookie|apikey)", re.IGNORECASE)
FOLDER_COMMAND_START = r"(?:^|[;&|(`{\n]|\$\(|\\n)"
FOLDER_SCAN_RULES = {
    "environment dump": re.compile(FOLDER_COMMAND_START + r"\s*[\"']?(?:set|env|printenv|export|declare|typeset|compgen)[\"']?\s*(?=$|[;&|)`}\n]|\\n|-p\b)", re.MULTILINE),
    "pass password manager": re.compile(FOLDER_COMMAND_START + r"\s*[\"']?pass[\"']?\s+[^\s;&|)]", re.MULTILINE),
    "whole environment": re.compile(r"process\.env\s*\[|\.\.\.\s*process\.env\b|=\s*process\.env\s*[;,\n)]|:\s*process\.env\s*[,}\n]"
                                    r"|\(\s*process\.env\s*\)|\bin\s+process\.env\b|os\.environ\b(?!\s*\.get\(\s*[\"'])"),
    "credential file": re.compile(r"\b(?:op read|op item get|gh auth token|security find-(?:generic|internet)-password|gcloud auth print"
                                  r"|aws configure get|secret-tool lookup|id_rsa|id_ed25519|\.netrc|\.git-credentials|\.npmrc|\.pypirc)\b"),
    "download and run": re.compile(r"(?:curl|wget)[^\n|]{0,200}\|\s*(?:sudo\s+)?(?:ba|z|da)?sh\b|\$\(\s*(?:curl|wget)|`\s*(?:curl|wget)|\b(?:iex|Invoke-Expression)\b"),
}


def folder_scan_findings(text: str) -> list[tuple[int, str, str]]:
    findings = []
    start = 0
    while (start := text.find("${", start)) >= 0:
        depth, end = 0, start + 1
        while end < len(text):
            depth += {"{": 1, "}": -1}.get(text[end], 0)
            if depth == 0:
                break
            end += 1
        inner = text[start + 2:end]
        if any(FOLDER_CREDENTIAL_NAME.search(name) for name in re.findall(r"[A-Za-z_][A-Za-z0-9_]*", inner)):
            findings.append((start, "credential expansion", "${" + inner[:60] + "}"))
        start += 2
    for match in re.finditer(r"(?<![\w$])\$([A-Za-z_][A-Za-z0-9_]*)", text):
        if FOLDER_CREDENTIAL_NAME.search(match.group(1)):
            findings.append((match.start(), "credential expansion", match.group(0)))
    for label, pattern in FOLDER_SCAN_RULES.items():
        findings.extend((match.start(), label, match.group(0).strip()[:60]) for match in pattern.finditer(text))
    return findings


def check_claude_folder_scan() -> None:
    for path in sorted(PLUGIN.rglob("*")):
        if not path.is_file() or path.suffix.lower() in DIRECTORY_IMAGE_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for offset, label, sample in folder_scan_findings(text):
            line = text.count("\n", 0, offset) + 1
            errors.append(f"{path.relative_to(ROOT)}:{line}: {label} ({sample!r}) reads as a credential read to the Claude "
                          "plugin directory scan; reword the source (cli: scripts/directory-scan.mjs)")


# Hermes's plugin-catalog CI treats a bundled script that names a GitHub
# download host and also writes or renames files as a self-updater and refuses
# the pin (catalog rule 3).
HERMES_GITHUB_FETCH = re.compile(r"releases/latest|releases/download|raw\.githubusercontent\.com|codeload\.github\.com")
HERMES_FILE_WRITE = re.compile(r"writeTextFile|renamePath|writeFile\(|writeFileSync|renameSync|copyFileSync|cpSync|createWriteStream")
HERMES_SCRIPT_SUFFIXES = {".js", ".mjs", ".cjs", ".ts", ".jsx", ".tsx", ".mts", ".cts"}


def check_hermes_self_updater() -> None:
    for path in sorted(AGENTS_PLUGIN.rglob("*")):
        if not path.is_file() or path.suffix not in HERMES_SCRIPT_SUFFIXES:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if HERMES_GITHUB_FETCH.search(text) and HERMES_FILE_WRITE.search(text):
            errors.append(f"{path.relative_to(ROOT)}: names a GitHub download host and writes files, which Hermes's "
                          "catalog CI rejects as a self-updater; move the URL out of this chunk or cite github.com")


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
    check_claude_folder_boundary()
    check_agents_package()
    check_directory_folder()
    check_budget()
    check_no_alternate_surfaces()
    check_taught_surface()
    check_scanner_patterns()
    check_claude_folder_scan()
    check_hermes_self_updater()
    if errors:
        print("ScreenRig plugin validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("ScreenRig plugin validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
