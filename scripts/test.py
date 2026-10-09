#!/usr/bin/env python3
"""Plugin tests.

`python3 scripts/test.py` checks the launcher, the freshness helper, the CalVer
stamp, skill commands against the bundled CLI, docs-only generation and the
public dependency boundary. The dashboard helper's tests need its locked Python
runtime: `<dashboard runtime python> scripts/test.py DashboardTests`, plus
`--browser` for real Chromium renders.
"""

from __future__ import annotations

import contextlib
import copy
import importlib.util
import io
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.parse import urljoin
from urllib.request import pathname2url

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent.parent
BROWSER = "--browser" in sys.argv
if BROWSER:
    sys.argv.remove("--browser")


def load_script(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load_script("build_plugin", "build-plugin.py")
checker = load_script("public_checker", "check-public-repo.py")


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def install_copy(source: Path, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(source.read_bytes())
    destination.chmod(destination.stat().st_mode | stat.S_IXUSR)
    return destination


def without(names: tuple[str, ...], **extra: str) -> dict[str, str]:
    env = {key: value for key, value in os.environ.items() if key not in names}
    env.update(extra)
    return env


# The package-relative launcher.
LAUNCHER = ROOT / "skills" / "screenrig" / "scripts" / "screenrig"
MISSING_MESSAGE = (
    "ScreenRig CLI is missing; install the official ScreenRig plugin from "
    "https://github.com/screenrig/plugin, or from a source checkout build "
    "cli/dist/bin.js."
)
LAUNCHER_ROOT_VARS = ("GROK_PLUGIN_ROOT", "SCREENRIG_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT", "CODEX_PLUGIN_ROOT")


class LauncherTests(unittest.TestCase):
    def test_node_minimum(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        with tempfile.TemporaryDirectory(prefix="screenrig-node-minimum-") as temporary:
            root = Path(temporary)
            launcher = install_copy(LAUNCHER, root / "skills/screenrig/scripts/screenrig")
            cli = root / "cli/dist/bin.js"
            cli.parent.mkdir(parents=True)
            cli.write_text('process.stdout.write("bundle\\n");\n', encoding="utf-8")
            shim = root / "bin/node"
            shim.parent.mkdir()
            shim.write_text(
                f"#!{node}\n"
                'Object.defineProperty(process.versions, "node", { value: process.env.TEST_NODE_VERSION });\n'
                'if (process.argv[2] === "-e") { eval(process.argv[3]); }\n'
                'else { process.stdout.write("bundle\\n"); }\n',
                encoding="utf-8",
            )
            shim.chmod(0o755)
            for version, accepted in (
                ("20.19.0", False), ("22.0.0", False), ("22.10.0", False),
                ("22.11.0", True), ("22.11.1", True), ("22.12.0", True),
                ("23.0.0", True), ("24.0.0", True),
            ):
                with self.subTest(version=version):
                    result = subprocess.run(
                        [str(launcher), "version"], text=True, capture_output=True, check=False,
                        env=without(LAUNCHER_ROOT_VARS, TEST_NODE_VERSION=version,
                                    PATH=f"{shim.parent}{os.pathsep}{os.environ['PATH']}"),
                    )
                    self.assertEqual(result.returncode, 0 if accepted else 69)
                    self.assertEqual(result.stdout, "bundle\n" if accepted else "")
                    self.assertEqual(result.stderr, "" if accepted else
                                     "ScreenRig requires Node.js 22.11 or newer; upgrade the active node runtime, then retry.\n")

    def test_resolution_order_and_missing_cli(self) -> None:
        errors: list[str] = []
        text = LAUNCHER.read_text(encoding="utf-8")
        for fact in ("../../../cli/dist/bin.js", *LAUNCHER_ROOT_VARS, "pwd -P", MISSING_MESSAGE):
            if fact not in text:
                errors.append(f"canonical launcher is missing fact: {fact}")
        if "SCREENRIG_CLI" in text:
            errors.append("canonical launcher must not add a SCREENRIG_CLI override")

        def stub(path: Path, marker: str) -> None:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(f'process.stdout.write("{marker}\\n");\n', encoding="utf-8")

        def install(destination: Path) -> Path:
            return install_copy(LAUNCHER, destination)

        def run(script: Path, env: dict[str, str]) -> subprocess.CompletedProcess[str]:
            return subprocess.run([str(script), "probe"], cwd=script.parent, env=env, text=True,
                                  capture_output=True, check=False)

        def env(**extra: str) -> dict[str, str]:
            return without(LAUNCHER_ROOT_VARS, **extra)

        def expect(label: str, result: subprocess.CompletedProcess[str], stdout: str) -> None:
            if result.returncode != 0:
                errors.append(f"{label}: exit {result.returncode}, expected 0")
            if result.stdout != stdout:
                errors.append(f"{label}: unexpected stdout {result.stdout!r}")
            if result.stderr:
                errors.append(f"{label}: stderr must stay empty on this path")

        with tempfile.TemporaryDirectory(prefix="screenrig-launcher-") as temporary:
            tmp = Path(temporary)
            bundle = tmp / "bundle"
            stub(bundle / "cli" / "dist" / "bin.js", "bundle")
            stub(tmp / "env-grok" / "cli" / "dist" / "bin.js", "grok")
            launcher = install(bundle / "skills" / "screenrig" / "scripts" / "screenrig")
            expect("bundle-relative wins", run(launcher, env(GROK_PLUGIN_ROOT=str(tmp / "env-grok"))), "bundle\n")

            roots = tmp / "env-only"
            for name in ("grok", "screenrig", "claude", "codex"):
                stub(roots / name / "cli" / "dist" / "bin.js", name)
            env_launcher = install(roots / "skills" / "screenrig" / "scripts" / "screenrig")
            grok, screenrig, claude, codex = (str(roots / name) for name in ("grok", "screenrig", "claude", "codex"))
            expect("GROK_PLUGIN_ROOT before other roots", run(env_launcher, env(
                GROK_PLUGIN_ROOT=grok, SCREENRIG_PLUGIN_ROOT=screenrig, CLAUDE_PLUGIN_ROOT=claude,
                CODEX_PLUGIN_ROOT=codex)), "grok\n")
            expect("SCREENRIG_PLUGIN_ROOT after empty GROK", run(env_launcher, env(
                SCREENRIG_PLUGIN_ROOT=screenrig, CLAUDE_PLUGIN_ROOT=claude, CODEX_PLUGIN_ROOT=codex)), "screenrig\n")
            expect("CLAUDE_PLUGIN_ROOT after earlier roots", run(env_launcher, env(
                CLAUDE_PLUGIN_ROOT=claude, CODEX_PLUGIN_ROOT=codex)), "claude\n")
            expect("CODEX_PLUGIN_ROOT last", run(env_launcher, env(CODEX_PLUGIN_ROOT=codex)), "codex\n")

            walked = tmp / "checkout"
            stub(walked / "cli" / "dist" / "bin.js", "walk")
            walk_launcher = install(walked / "deep" / "skills" / "screenrig" / "scripts" / "screenrig")
            expect("parent walk finds checkout CLI", run(walk_launcher, env()), "walk\n")

            env_beats_walk = tmp / "env-beats-walk"
            stub(env_beats_walk / "cli" / "dist" / "bin.js", "walk")
            stub(env_beats_walk / "plugin" / "cli" / "dist" / "bin.js", "env")
            env_walk_launcher = install(env_beats_walk / "deep" / "skills" / "screenrig" / "scripts" / "screenrig")
            expect("plugin root beats parent walk",
                   run(env_walk_launcher, env(GROK_PLUGIN_ROOT=str(env_beats_walk / "plugin"))), "env\n")

            physical = tmp / "physical"
            stub(physical / "cli" / "dist" / "bin.js", "physical")
            install(physical / "nest" / "skills" / "screenrig" / "scripts" / "screenrig")
            logical_skill = tmp / "logical" / "nest" / "skills" / "screenrig"
            logical_skill.parent.mkdir(parents=True)
            logical_skill.symlink_to(physical / "nest" / "skills" / "screenrig", target_is_directory=True)
            expect("physical walk after logical miss", run(logical_skill / "scripts" / "screenrig", env()), "physical\n")

            missing = tmp / "missing"
            missing_result = run(install(missing / "skills" / "screenrig" / "scripts" / "screenrig"), env())
            if missing_result.returncode != 78:
                errors.append(f"missing CLI: exit {missing_result.returncode}, expected 78")
            if missing_result.stdout:
                errors.append("missing CLI: stdout must stay empty")
            if missing_result.stderr.strip() != MISSING_MESSAGE:
                errors.append(f"missing CLI: unexpected stderr {missing_result.stderr!r}")
            if str(missing) in missing_result.stderr:
                errors.append("missing CLI: stderr leaked a filesystem path")
        self.assertFalse(errors, "\n".join(errors))


# The plugin detect-and-refresh helper.
HELPER = ROOT / "skills" / "screenrig" / "scripts" / "screenrig-plugin-freshness"
FRESHNESS_VARS = ("SCREENRIG_PLUGIN_ROOT", "GROK_PLUGIN_ROOT", "CODEX_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT",
                  "PLUGIN_ROOT", "SCREENRIG_PUBLISHED_MARKETPLACE_URL")
DEFAULT_MARKETPLACE_URL = "https://raw.githubusercontent.com/screenrig/plugin/main/.claude-plugin/marketplace.json"


class FreshnessTests(unittest.TestCase):
    def test_detect_and_refresh(self) -> None:
        errors: list[str] = []
        text = HELPER.read_text(encoding="utf-8")
        for fact in (DEFAULT_MARKETPLACE_URL, "plugins[0].version", "continue_installed",
                     "published_version_unavailable", "GROK_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT", "CODEX_PLUGIN_ROOT"):
            if fact not in text:
                errors.append(f"canonical helper is missing fact: {fact}")
        if "SCREENRIG_TOKEN" in text or "npm i -g" in text:
            errors.append("canonical helper must not mention tokens or a global npm install")

        def file_url(path: Path) -> str:
            return urljoin("file:", pathname2url(str(path.resolve())))

        def env(**extra: str) -> dict[str, str]:
            return without(FRESHNESS_VARS, **extra)

        def stub_screenrig(destination: Path, version: str) -> None:
            envelope = json.dumps({"ok": True, "data": {"version": version}, "warnings": []})
            destination.write_text(f"#!/bin/sh\nprintf '%s\\n' '{envelope}'\n", encoding="utf-8")
            destination.chmod(destination.stat().st_mode | stat.S_IXUSR)

        def plugin_tree(root: Path, version: str) -> None:
            write_json(root / ".claude-plugin" / "plugin.json", {"name": "screenrig", "version": version})
            write_json(root / ".codex-plugin" / "plugin.json", {"name": "screenrig", "version": version})

        def marketplace_file(path: Path, version: str | None) -> None:
            entry: dict[str, object] = {"name": "screenrig"}
            if version is not None:
                entry["version"] = version
            write_json(path, {"name": "screenrig", "plugins": [entry]})

        def run(script: Path, environment: dict[str, str], args: list[str] | None = None):
            return subprocess.run(["node", str(script), *(["--json"] if args is None else args)], cwd=script.parent,
                                  env=environment, text=True, capture_output=True, check=False)

        def expect(label: str, result, *, action: str, stale: bool, published: str | None,
                   plugin: str | None, cli: str | None, warning: str | None = None) -> None:
            if result.returncode != 0:
                errors.append(f"{label}: exit {result.returncode}, expected 0")
            if result.stderr:
                errors.append(f"{label}: stderr must stay empty on success, got {result.stderr!r}")
            try:
                envelope = json.loads(result.stdout)
            except json.JSONDecodeError:
                errors.append(f"{label}: stdout is not JSON: {result.stdout!r}")
                return
            data = envelope.get("data") if isinstance(envelope, dict) else None
            warnings = envelope.get("warnings") if isinstance(envelope, dict) else None
            if envelope.get("ok") is not True or not isinstance(data, dict):
                errors.append(f"{label}: expected a success envelope, got {result.stdout!r}")
                return
            for key, expected in (("action", action), ("published_version", published),
                                  ("installed_plugin_version", plugin), ("installed_cli_version", cli)):
                if data.get(key) != expected:
                    errors.append(f"{label}: {key} {data.get(key)!r}, expected {expected!r}")
            if data.get("stale") is not stale:
                errors.append(f"{label}: stale {data.get('stale')!r}, expected {stale!r}")
            if warning is None:
                if warnings not in ([], None):
                    errors.append(f"{label}: unexpected warnings {warnings!r}")
            elif not isinstance(warnings, list) or not any(
                isinstance(item, dict) and item.get("code") == warning for item in warnings
            ):
                errors.append(f"{label}: missing warning {warning!r} in {warnings!r}")

        with tempfile.TemporaryDirectory(prefix="screenrig-plugin-freshness-") as temporary:
            tmp = Path(temporary)
            scripts = tmp / "scripts"
            helper = install_copy(HELPER, scripts / "screenrig-plugin-freshness")
            plugin_root = tmp / "plugin"
            marketplace = tmp / "marketplace.json"
            plugin_tree(plugin_root, "26.09.1")
            stub_screenrig(scripts / "screenrig", "26.09.1")
            marketplace_file(marketplace, "26.09.1")
            current = env(SCREENRIG_PLUGIN_ROOT=str(plugin_root), SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(marketplace))
            expect("current pair", run(helper, current), action="keep", stale=False,
                   published="26.09.1", plugin="26.09.1", cli="26.09.1")

            plugin_tree(plugin_root, "0.1.2")
            stub_screenrig(scripts / "screenrig", "0.1.2")
            expect("stale 0.1.2 vs 26.09.1", run(helper, current), action="refresh", stale=True,
                   published="26.09.1", plugin="0.1.2", cli="0.1.2")

            plugin_tree(plugin_root, "26.09.1")
            stub_screenrig(scripts / "screenrig", "0.1.0")
            expect("stale CLI only", run(helper, current), action="refresh", stale=True,
                   published="26.09.1", plugin="26.09.1", cli="0.1.0")

            # Released installs compare as CalVer, not raw strings: an installed
            # release equal to the published release is fresh, an older release is
            # stale, and an old `-dev` install is below any published release.
            release_marketplace = tmp / "release-marketplace.json"
            marketplace_file(release_marketplace, "26.09.7")
            release = env(SCREENRIG_PLUGIN_ROOT=str(plugin_root),
                          SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(release_marketplace))
            for label, installed, action, stale in (
                ("release install equal to published", "26.09.7", "keep", False),
                ("older release install", "26.08.3", "refresh", True),
                ("dev install against a release", "26.09.0-dev", "refresh", True),
                ("newer release install", "26.09.8", "keep", False),
            ):
                plugin_tree(plugin_root, installed)
                stub_screenrig(scripts / "screenrig", installed)
                expect(label, run(helper, release), action=action, stale=stale,
                       published="26.09.7", plugin=installed, cli=installed)

            plugin_tree(plugin_root, "26.09.7")
            stub_screenrig(scripts / "screenrig", "26.09.7")
            unavailable = env(SCREENRIG_PLUGIN_ROOT=str(plugin_root),
                              SCREENRIG_PUBLISHED_MARKETPLACE_URL="http://127.0.0.1:1/.claude-plugin/marketplace.json")
            expect("published unavailable", run(helper, unavailable), action="continue_installed", stale=False,
                   published=None, plugin="26.09.7", cli="26.09.7", warning="published_version_unavailable")

            # With no plugin root in the environment the helper reads its own
            # install location, and with no plugin manifest anywhere it says so
            # instead of reporting a refresh that can never converge.
            installed_root = tmp / "installed" / "screenrig"
            plugin_tree(installed_root, "26.09.7")
            installed_scripts = installed_root / "skills" / "screenrig" / "scripts"
            installed_helper = install_copy(HELPER, installed_scripts / "screenrig-plugin-freshness")
            stub_screenrig(installed_scripts / "screenrig", "26.09.7")
            loose = env(SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(release_marketplace))
            expect("plugin root from the helper's own path", run(installed_helper, loose), action="keep",
                   stale=False, published="26.09.7", plugin="26.09.7", cli="26.09.7")
            expect("no plugin root", run(helper, loose), action="not_installed", stale=False, published=None,
                   plugin=None, cli="26.09.7", warning="plugin_not_installed")
            expect("environment root without a plugin manifest",
                   run(helper, env(SCREENRIG_PLUGIN_ROOT=str(scripts),
                                   SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(release_marketplace))),
                   action="not_installed", stale=False, published=None, plugin=None, cli="26.09.7",
                   warning="plugin_not_installed")

            missing_json = run(helper, current, args=[])
            if missing_json.returncode != 2:
                errors.append(f"missing --json: exit {missing_json.returncode}, expected 2")

            checkout_root = ROOT / "plugins" / "screenrig"
            checkout_marketplace = ROOT / ".claude-plugin" / "marketplace.json"
            if checkout_root.is_dir() and checkout_marketplace.is_file():
                # The packaged helper with no plugin root in the environment, against
                # this checkout's own marketplace, finds its plugin from its own path
                # and converges; the source copy under skills/ belongs to no installed
                # plugin and must not ask to refresh.
                for label, script, expected in (
                    ("packaged checkout helper",
                     checkout_root / "skills" / "screenrig" / "scripts" / "screenrig-plugin-freshness", "keep"),
                    ("source checkout helper", HELPER, "not_installed"),
                ):
                    checkout = subprocess.run(
                        ["node", str(script), "--json"], cwd=ROOT, text=True, capture_output=True, check=False,
                        env=env(SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(checkout_marketplace)),
                    )
                    if checkout.returncode != 0:
                        errors.append(f"{label}: exit {checkout.returncode}, expected 0")
                    if checkout.stderr:
                        errors.append(f"{label}: stderr must stay empty, got {checkout.stderr!r}")
                    try:
                        checkout_envelope = json.loads(checkout.stdout)
                    except json.JSONDecodeError:
                        checkout_envelope = {}
                    data = checkout_envelope.get("data") if isinstance(checkout_envelope, dict) else None
                    if checkout_envelope.get("ok") is not True or not isinstance(data, dict):
                        errors.append(f"{label}: expected a success envelope, got {checkout.stdout!r}")
                    elif data.get("action") != expected:
                        errors.append(f"{label}: action {data.get('action')!r}, expected {expected!r}")
        self.assertFalse(errors, "\n".join(errors))


class CalVerTests(unittest.TestCase):
    def test_stamp_reports_one_version_everywhere(self) -> None:
        # Freshness compares the installed plugin and bundled CLI against the
        # published CalVer, so a bundled CLI left behind would look stale forever.
        with tempfile.TemporaryDirectory(prefix="screenrig-plugin-calver-") as temporary:
            tmp = Path(temporary)
            plugin_root = tmp / "screenrig"
            marketplace = tmp / "marketplace.json"
            write_json(plugin_root / "cli" / "package.json", {"name": "screenrig", "version": "26.09.6"})
            for platform in ("claude", "codex"):
                write_json(plugin_root / f".{platform}-plugin" / "plugin.json", {"name": "screenrig", "version": "26.09.6"})
            write_json(marketplace, {"name": "screenrig", "plugins": [{"name": "screenrig", "version": "26.09.6"}]})
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts" / "calver.py"), "stamp", "--version", "26.09.7",
                 "--marketplace", str(marketplace), "--plugin-root", str(plugin_root)],
                cwd=ROOT, text=True, capture_output=True, check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr.strip())
            self.assertEqual(json.loads(marketplace.read_text())["plugins"][0]["version"], "26.09.7")
            for path in (plugin_root / "cli" / "package.json", plugin_root / ".claude-plugin" / "plugin.json",
                         plugin_root / ".codex-plugin" / "plugin.json"):
                self.assertEqual(json.loads(path.read_text())["version"], "26.09.7", path.name)


# Skill commands must exist in the bundled CLI.
COMMANDS_REFERENCE = ROOT / "skills" / "screenrig" / "references" / "commands.md"
BUNDLED_LAUNCHER = ROOT / "plugins" / "screenrig" / "skills" / "screenrig" / "scripts" / "screenrig"
REQUIRED_COMMANDS = ("media generate", "media download")


def taught_commands(commands_text: str) -> list[str]:
    found: list[str] = []
    for raw in commands_text.splitlines():
        stripped = raw.strip()
        if not stripped or stripped[0] in "-([" or not re.match(r"^([a-z]+(?: [a-z][a-z0-9-]*)*)\b", stripped):
            continue
        tokens: list[str] = []
        for part in stripped.split():
            if part[0] in "-<([" or not re.fullmatch(r"[a-z][a-z0-9-]*", part):
                break
            tokens.append(part)
        command = " ".join(tokens)
        if tokens and command not in found:
            found.append(command)
    return found


class SkillCommandTests(unittest.TestCase):
    def run_cli(self, *args: str) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory(prefix="screenrig-skill-commands-") as temporary:
            return subprocess.run(
                [str(BUNDLED_LAUNCHER), *args], cwd=ROOT, text=True, capture_output=True, check=False,
                env={"PATH": os.environ.get("PATH", ""), "XDG_CONFIG_HOME": str(Path(temporary) / "config")},
            )

    def test_taught_commands_exist_in_bundled_cli(self) -> None:
        errors: list[str] = []
        match = re.search(r"## Commands\s+```text\n(.*?)```", COMMANDS_REFERENCE.read_text(encoding="utf-8"), re.S)
        if match is None:
            errors.append("skills/screenrig/references/commands.md: Commands list missing")
        commands_text = match.group(1) if match else ""
        taught = taught_commands(commands_text)
        for command in REQUIRED_COMMANDS:
            if command not in commands_text:
                errors.append(f"Commands list missing {command}")
            if command not in taught:
                taught.append(command)
        help_result = self.run_cli("--json", "help", "--all")
        try:
            envelope = json.loads(help_result.stdout)
            inventory = envelope["data"]["allCommands"]
            if help_result.returncode != 0 or envelope.get("ok") is not True:
                raise ValueError("help failed")
            if not isinstance(inventory, list) or not all(isinstance(item, str) for item in inventory):
                raise ValueError("invalid command inventory")
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            errors.append("bundled CLI help --all must return a successful structured command inventory")
            inventory = []
        errors.extend(f"bundled CLI inventory is missing taught command {command}"
                      for command in taught if command not in inventory)

        generate = self.run_cli("--json", "media", "generate")
        if "Unknown media command" in f"{generate.stdout}\n{generate.stderr}":
            errors.append("bundled CLI rejected media generate as Unknown media command")
        else:
            try:
                envelope = json.loads(generate.stdout)
            except json.JSONDecodeError:
                envelope = {}
            error = envelope.get("error") if isinstance(envelope, dict) else None
            if (error.get("code") if isinstance(error, dict) else None) in {None, "unknown_command"}:
                errors.append("bundled media generate must be a real command, not an unknown command")
        self.assertFalse(errors, "\n".join(errors))


class DocsOnlyTests(unittest.TestCase):
    """Documentation refresh preserves executable bytes and provenance."""

    def run_builder(self, *args: str) -> int:
        with patch.object(sys, "argv", ["build-plugin.py", *args]):
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                return builder.main()

    def test_docs_only_preserves_cli_and_provenance(self) -> None:
        run = self.run_builder
        with tempfile.TemporaryDirectory(prefix="screenrig-docs-only-test-") as temporary:
            root = Path(temporary)
            plugins = root / "plugins"
            target = plugins / "screenrig"
            protected = {
                target / "cli/package.json": b'{"version":"26.09.1"}\n',
                target / "cli/dist/bin.js": b"// preserved executable\n",
                target / ".codex-plugin/plugin.json": b'{"version":"26.09.1"}\n',
                target / ".claude-plugin/plugin.json": b'{"version":"26.09.1"}\n',
                root / "components.lock.json": b'{"provenance":"preserved"}\n',
            }
            for path, content in protected.items():
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(content)
            executable = target / "cli/dist/bin.js"
            executable.chmod(0o755)
            stale = target / "skills/screenrig/references/obsolete.md"
            stale.parent.mkdir(parents=True)
            stale.write_text("obsolete generated documentation\n")
            with patch.object(builder, "PLUGINS", plugins), patch.object(builder, "LOCK_PATH", root / "components.lock.json"):
                self.assertEqual(run("--docs-only", "--check"), 1)
                self.assertEqual(run("--docs-only"), 0)
                self.assertFalse(stale.exists())
                dashboard_skill = target / "skills/screenrig-dashboard"
                self.assertTrue((dashboard_skill / "SKILL.md").is_file())
                self.assertTrue((dashboard_skill / "scripts/screenrig-dashboard").stat().st_mode & 0o111)
                (dashboard_skill / "references/obsolete.md").write_text("stale dashboard documentation\n")
                self.assertEqual(run("--docs-only", "--check"), 1)
                self.assertEqual(run("--docs-only"), 0)
                self.assertFalse((dashboard_skill / "references/obsolete.md").exists())
                self.assertEqual(run("--docs-only", "--check"), 0)
                for path, content in protected.items():
                    self.assertEqual(path.read_bytes(), content, f"changed protected file: {path}")
                self.assertEqual(executable.stat().st_mode & 0o777, 0o755)
                for options in (("--cli-artifact", "unused.tgz"), ("--write-lock",), ("--cli-commit", "a" * 40)):
                    self.assertEqual(run("--docs-only", *options), 2)
                (target / "cli/package.json").unlink()
                self.assertEqual(run("--docs-only"), 2)


class DependencyBoundaryTests(unittest.TestCase):
    """The reviewed CLI dependency boundary, checked without mutating the bundle."""

    def test_allowlist_is_the_reviewed_production_set(self) -> None:
        self.assertEqual(set(checker.ALLOWED_CLI_PRODUCTION_DEPENDENCIES),
                         {"@napi-rs/canvas", "ajv", "ajv-formats", "commander"})

    def check_with(self, mutation=None) -> list[str]:
        original_load = checker.load

        def load(path, errors):
            value = copy.deepcopy(original_load(path, errors))
            if mutation:
                mutation(path, value)
            return value

        errors: list[str] = []
        with patch.object(checker, "load", load):
            checker.check_metadata(errors)
        return errors

    def change(self, relative: str, edit) -> list[str]:
        return self.check_with(lambda path, value: edit(value) if path == checker.BUNDLE / "cli" / relative else None)

    def test_reviewed_artifact_dependencies_pass(self) -> None:
        self.assertEqual(self.check_with(), [])

    def test_dependency_changes_rejected(self) -> None:
        for edit, message in (
            (lambda value: value["dependencies"].update({"unexpected-package": "1.0.0"}), "extra ['unexpected-package']"),
            (lambda value: value["dependencies"].pop("ajv"), "missing ['ajv']"),
            (lambda value: value["dependencies"].pop("commander"), "missing ['commander']"),
            (lambda value: value.update(dependencies=[]), "dependencies must be an object"),
        ):
            errors = self.change("package.json", edit)
            self.assertTrue(any(message in error for error in errors), (message, errors))

    def test_runtime_lock_changes_rejected(self) -> None:
        def pin(value):
            value["packages"][0]["version"] = "0.0.0-invalid"

        def drop(value):
            value["packages"] = [item for item in value["packages"] if item["name"] != "ajv"]

        for edit, message in ((pin, "dependency differs from its manifest"),
                              (drop, "missing a declared production dependency")):
            errors = self.change("runtime-dependencies.lock.json", edit)
            self.assertTrue(any(message in error for error in errors), (message, errors))


# The dashboard helper, on synthetic data. Needs the helper's locked runtime.
DASHBOARD_SKILL = ROOT / "skills" / "screenrig-dashboard"
sys.path.insert(0, str(DASHBOARD_SKILL / "scripts"))
from dashboard_runtime import dashboard  # noqa: E402
from dashboard_runtime.store import Error, Store, atomic  # noqa: E402

DATASET = {"id": "test-metrics", "description": "Synthetic measured hourly counts", "grain": "One item per hour",
           "key": ["observed"], "time_field": "observed", "fields": {
               "observed": {"type": "timestamp"}, "count": {"type": "integer", "minimum": 0, "kind": "period_total"},
               "money": {"type": "decimal", "scale": 2, "unit": "CAD", "nullable": True}}}
ROWS = [{"observed": "2026-01-01T00:00:00Z", "count": 0, "money": "0.10"},
        {"observed": "2026-01-01T01:00:00Z", "count": 4, "money": None}]


class DashboardTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.store = Store(self.root / "state")
        self.store.register(copy.deepcopy(DATASET))
        self.input = self.root / "input.json"
        atomic(self.input, ROWS)
        self.batch = {"inputs": [{"dataset": "test-metrics", "path": str(self.input)}]}

    def tearDown(self) -> None:
        self.store.db.close()
        self.temp.cleanup()

    def ingest(self, rows=None, **kwargs):
        if rows is not None:
            atomic(self.input, rows)
        return self.store.ingest(self.batch, self.root, **kwargs)

    def spec(self):
        return {"id": "test-board", "title": "Test metrics", "subtitle": "Synthetic fixture", "timezone": "UTC",
                "queries": {"latest": {"dataset": "test-metrics", "mode": "latest"},
                            "hours": {"dataset": "test-metrics", "mode": "series", "field": "count",
                                      "interval": "hour", "count": 4, "aggregate": "sum"}},
                "widgets": [{"id": "total", "type": "metric", "title": "Latest count", "query": "latest",
                             "field": "count", "rect": [40, 116, 400, 170]},
                            {"id": "trend", "type": "line", "title": "Hourly observations", "query": "hours",
                             "rect": [40, 310, 1000, 350]}]}

    def test_embedded_fonts_match_the_lock(self):
        import base64
        import hashlib
        lock = json.loads((DASHBOARD_SKILL / "dependencies.lock.json").read_text())
        css = (DASHBOARD_SKILL / "assets/renderer/style.css").read_text()
        faces = re.findall(r"url\('data:font/woff2;base64,([A-Za-z0-9+/=]+)'\);font-weight:(\d+);", css)
        self.assertEqual({f"inter-{weight}.woff2": hashlib.sha256(base64.b64decode(data)).hexdigest()
                          for data, weight in faces}, lock["fonts"])

    def test_retry_and_cross_format_duplicate(self):
        first = self.ingest()
        again = self.ingest()
        self.assertEqual(first["inserted"], 2)
        self.assertEqual(again["duplicates"], 2)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM "d_test-metrics"').fetchone()[0], 2)
        file = self.root / "input.csv"
        file.write_text("observed,count,money\n2026-01-01T00:00:00Z,0,0.10\n")
        result = self.store.ingest({"inputs": [{"dataset": "test-metrics", "path": str(file)}]}, self.root)
        self.assertEqual(result["duplicates"], 1)

    def test_correction_preserves_snapshot(self):
        initial = self.ingest()
        changed = copy.deepcopy(ROWS)
        changed[1]["count"] = 9
        with self.assertRaises(Error):
            self.ingest(changed)
        result = self.ingest(changed, correction=True)
        self.assertEqual(result["corrected"], 1)
        old = self.store.records("test-metrics", initial["seq"], "2026-01-02T00:00:00.000Z")
        new = self.store.records("test-metrics", result["seq"], "2026-01-02T00:00:00.000Z")
        self.assertEqual(old[-1]["count"], 4)
        self.assertEqual(new[-1]["count"], 9)

    def test_invalid_batch_is_atomic(self):
        rows = copy.deepcopy(ROWS)
        rows[1]["count"] = -2
        with self.assertRaises(Error):
            self.ingest(rows)
        self.assertEqual(self.store.db.execute("SELECT COUNT(*) FROM ingestions").fetchone()[0], 0)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM "d_test-metrics"').fetchone()[0], 0)

    def test_decimal_is_exact_and_excess_precision_rejected(self):
        self.ingest()
        self.assertEqual(self.store.db.execute(
            'SELECT money FROM "d_test-metrics" WHERE money IS NOT NULL').fetchone()[0], 10)
        rows = copy.deepcopy(ROWS)
        rows[0]["money"] = "0.105"
        with self.assertRaises(Error):
            self.ingest(rows, correction=True)

    def test_unknown_field_and_ambiguous_time_rejected(self):
        for record in [ROWS[0] | {"extra": 1}, ROWS[0] | {"observed": "2026-01-01T00:00:00"}]:
            with self.assertRaises(Error):
                self.ingest([record])

    def test_duplicate_keys_inside_batch(self):
        self.assertEqual(self.ingest([ROWS[0], ROWS[0]])["inserted"], 1)
        with self.assertRaises(Error):
            self.ingest([ROWS[0], ROWS[0] | {"count": 7}])

    def test_definition_reuse_and_drift_rejection(self):
        self.assertFalse(self.store.register(DATASET)["created"])
        changed = copy.deepcopy(DATASET)
        changed["fields"]["count"]["unit"] = "different"
        with self.assertRaises(Error):
            self.store.register(changed)
        changed["id"] = 'bad"; DROP TABLE datasets;'
        with self.assertRaises(Error):
            self.store.register(changed)

    def test_snapshot_gaps_and_consistent_replay(self):
        self.ingest()
        dashboard.register(self.store, self.spec(), DASHBOARD_SKILL)
        first = dashboard.snapshot(self.store, "test-board", "2026-01-01T04:00:00Z")
        again = dashboard.snapshot(self.store, "test-board", "2026-01-01T04:00:00Z")
        self.assertEqual(first["digest"], again["digest"])
        payload = json.loads(Path(first["path"]).read_text())
        self.assertEqual([p["value"] for p in payload["queries"]["hours"]["points"]], ["0", "4", None, None])
        self.assertEqual(payload["queries"]["latest"]["row"]["count"], 4)

    def test_schema_rejects_overlap_and_invalid_binding(self):
        spec = self.spec()
        spec["widgets"][1]["rect"] = [40, 120, 400, 200]
        with self.assertRaises(Error):
            dashboard.register(self.store, spec, DASHBOARD_SKILL)
        spec = self.spec()
        spec["widgets"][0]["field"] = "absent"
        with self.assertRaises(Error):
            dashboard.register(self.store, spec, DASHBOARD_SKILL)

    def test_snapshot_metric_cannot_be_summed(self):
        snapshot_dataset = copy.deepcopy(DATASET)
        snapshot_dataset["id"] = "snapshot"
        snapshot_dataset["fields"]["count"]["kind"] = "snapshot"
        self.store.register(snapshot_dataset)
        spec = self.spec()
        spec["queries"]["hours"]["dataset"] = "snapshot"
        with self.assertRaises(Error):
            dashboard.register(self.store, spec, DASHBOARD_SKILL)

    def test_fresh_process_registry(self):
        self.ingest()
        other = Store(self.root / "state")
        self.assertEqual(other.list_datasets("hourly")[0]["id"], "test-metrics")
        other.db.close()

    def test_day_buckets_follow_dst(self):
        query = {"mode": "series", "field": "count", "interval": "day", "count": 3, "aggregate": "sum"}
        result = dashboard.run_query([], DATASET, query, "2026-03-10T07:00:00.000Z", dashboard.zone("America/Los_Angeles"))
        self.assertEqual([p["time"] for p in result["points"]],
                         ["2026-03-07T08:00:00.000Z", "2026-03-08T08:00:00.000Z", "2026-03-09T07:00:00.000Z"])

    @unittest.skipUnless(BROWSER, "use --browser for real Chromium")
    def test_real_browser_repeat_and_failed_render_preserves_latest(self):
        from dashboard_runtime.render import render, webp_dimensions
        self.ingest()
        dashboard.register(self.store, self.spec(), DASHBOARD_SKILL)
        meta = dashboard.snapshot(self.store, "test-board", "2026-01-01T04:00:00Z")
        a = render(self.store, meta, DASHBOARD_SKILL)
        b = render(self.store, meta, DASHBOARD_SKILL)
        self.assertEqual(a["pixel_sha256"], b["pixel_sha256"])
        self.assertEqual(a["sha256"], b["sha256"])
        self.assertEqual(webp_dimensions(Path(a["image"]).read_bytes()), (3840, 2160))
        latest = (self.store.root / "dashboards/test-board/latest.json").read_bytes()
        self.ingest([{"observed": "2025-12-31T00:00:00Z", "count": 2, "money": None}])
        historical = dashboard.snapshot(self.store, "test-board", "2026-01-01T02:00:00Z")
        replay = render(self.store, historical, DASHBOARD_SKILL)
        self.assertFalse(replay["promoted"])
        self.assertEqual((self.store.root / "dashboards/test-board/latest.json").read_bytes(), latest)
        asset = self.store.root / "dashboards/test-board/revisions/1/assets/renderer/style.css"
        asset.write_text("body{}")
        with self.assertRaises(Error):
            render(self.store, meta, DASHBOARD_SKILL)
        self.assertEqual((self.store.root / "dashboards/test-board/latest.json").read_bytes(), latest)


class MCPConnectionTests(unittest.TestCase):
    def test_skill_dependency_matches_registered_server(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            builder.emit_manifests(root, builder.METADATA, builder.version())
            servers = json.loads((root / ".codex-plugin/mcp.json").read_text())["mcpServers"]
            for skill_root in (ROOT, ROOT / "plugins/screenrig"):
                metadata = (skill_root / "skills/screenrig/agents/openai.yaml").read_text()
                dependency = metadata.split("dependencies:", 1)[1]
                name = re.search(r'value: "([^"]+)"', dependency).group(1)
                url = re.search(r'url: "([^"]+)"', dependency).group(1)
                self.assertIn(name, servers)
                self.assertEqual(url, servers[name]["url"])
                self.assertIn('transport: "streamable_http"', dependency)

    def test_remote_oauth_declarations_and_retired_helper(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            builder.emit_manifests(root, builder.METADATA, "26.10.0-dev")
            for host in ("codex", "claude"):
                manifest = json.loads((root / f".{host}-plugin/plugin.json").read_text())
                if host == "codex":
                    self.assertEqual(manifest["mcpServers"], "./.codex-plugin/mcp.json")
                    manifest = json.loads((root / ".codex-plugin/mcp.json").read_text())
                server = manifest["mcpServers"]["screenrig-views"]
                self.assertEqual(server["url"], "https://api.screenrig.ai/mcp")
                self.assertEqual(server["type"], "http")
                scopes = server["scopes"] if host == "codex" else server["oauth"]["scopes"].split()
                self.assertEqual(scopes, ["access:read", "screens", "content", "playlists", "reports"])
                self.assertNotIn("identity", scopes)
                self.assertEqual(set(server), {"type", "url", "scopes" if host == "codex" else "oauth"})
        for root in (ROOT, ROOT / "plugins/screenrig"):
            self.assertFalse((root / "skills/screenrig/scripts/screenrig-mcp-auth.mjs").exists())

    def test_validator_rejects_credential_and_endpoint_overrides(self):
        validator = load_script("connection_validator", "validate-plugin.py")
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            builder.emit_manifests(root, builder.METADATA, builder.version())
            manifest_path = root / ".codex-plugin/mcp.json"
            original = json.loads(manifest_path.read_text())
            for field, value in (("headers", {"Authorization": "synthetic"}),
                                 ("url", "https://wrong.example/mcp"),
                                 ("command", "credential-helper")):
                manifest = copy.deepcopy(original)
                manifest["mcpServers"]["screenrig-views"][field] = value
                write_json(manifest_path, manifest)
                validator.errors.clear()
                with patch.object(validator, "PLUGIN", root):
                    validator.check_no_alternate_surfaces(None)
                self.assertTrue(any("host-managed OAuth" in error for error in validator.errors))


if __name__ == "__main__":
    unittest.main(defaultTest=["LauncherTests", "FreshnessTests", "CalVerTests", "SkillCommandTests",
                               "DocsOnlyTests", "DependencyBoundaryTests", "MCPConnectionTests"])
