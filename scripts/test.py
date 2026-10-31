#!/usr/bin/env python3
"""Plugin tests.

`python3 scripts/test.py` checks the launcher, the freshness helper, the CalVer
stamp, skill commands against the bundled CLI, docs-only generation and the
public dependency boundary.
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
VIEW_BRIDGE = ROOT / "skills" / "screenrig-view-bridge" / "scripts" / "screenrig-view-bridge"
MISSING_MESSAGE = (
    "screenRIG CLI is missing; install the official screenRIG plugin from "
    "https://github.com/screenrig/plugin, or from a source checkout build "
    "cli/dist/bin.js."
)
LAUNCHER_ROOT_VARS = ("GROK_PLUGIN_ROOT", "SCREENRIG_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT", "CODEX_PLUGIN_ROOT")


class LauncherTests(unittest.TestCase):
    def test_node_minimum(self) -> None:
        # A PATH entry may be a version-manager shim that recurses when this
        # test installs its own `node`. Shebangs need the actual interpreter.
        node = subprocess.check_output(["node", "-p", "process.execPath"], text=True).strip()
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
                ("22.11.0", False), ("22.23.3", False), ("22.23.4", True),
                ("22.24.0", True), ("23.9.0", False), ("24.22.0", False),
                ("24.22.1", True), ("24.23.0", True), ("25.9.0", False),
                ("26.12.0", False), ("26.12.1", True), ("27.0.0", True),
                ("26.13.0-rc.1", False), ("invalid", False),
            ):
                with self.subTest(version=version):
                    result = subprocess.run(
                        [str(launcher), "version"], text=True, capture_output=True, check=False,
                        env=without(LAUNCHER_ROOT_VARS, TEST_NODE_VERSION=version,
                                    PATH=f"{shim.parent}{os.pathsep}{os.environ['PATH']}"),
                    )
                    self.assertEqual(result.returncode, 0 if accepted else 69, result.stderr)
                    self.assertEqual(result.stdout, "bundle\n" if accepted else "")
                    self.assertEqual(result.stderr, "" if accepted else
                                     "screenRIG requires Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x); upgrade the active node runtime, then retry.\n")

    def test_resolution_order_and_missing_cli(self) -> None:
        errors: list[str] = []
        text = LAUNCHER.read_text(encoding="utf-8")
        for fact in ("../../../cli/dist/bin.js", *LAUNCHER_ROOT_VARS, MISSING_MESSAGE):
            if fact not in text:
                errors.append(f"canonical launcher is missing fact: {fact}")
        if "SCREENRIG_CLI" in text:
            errors.append("canonical launcher must not add a SCREENRIG_CLI override")
        if "walk_exec" in text or "pwd -P" in text:
            errors.append("canonical launcher must not search ancestor directories for a CLI")

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

            def expect_missing(label: str, result: subprocess.CompletedProcess[str]) -> None:
                if result.returncode != 78:
                    errors.append(f"{label}: exit {result.returncode}, expected 78")
                if result.stdout:
                    errors.append(f"{label}: ran a CLI found by walking up ({result.stdout!r})")
                if result.stderr.strip() != MISSING_MESSAGE:
                    errors.append(f"{label}: unexpected stderr {result.stderr!r}")

            walked = tmp / "checkout"
            stub(walked / "cli" / "dist" / "bin.js", "walk")
            walk_launcher = install(walked / "deep" / "skills" / "screenrig" / "scripts" / "screenrig")
            expect_missing("a CLI in an ancestor directory is never run", run(walk_launcher, env()))

            env_beats_walk = tmp / "env-beats-walk"
            stub(env_beats_walk / "cli" / "dist" / "bin.js", "walk")
            stub(env_beats_walk / "plugin" / "cli" / "dist" / "bin.js", "env")
            env_walk_launcher = install(env_beats_walk / "deep" / "skills" / "screenrig" / "scripts" / "screenrig")
            expect("plugin root is used, not an ancestor CLI",
                   run(env_walk_launcher, env(GROK_PLUGIN_ROOT=str(env_beats_walk / "plugin"))), "env\n")

            physical = tmp / "physical"
            stub(physical / "cli" / "dist" / "bin.js", "physical")
            install(physical / "nest" / "skills" / "screenrig" / "scripts" / "screenrig")
            logical_skill = tmp / "logical" / "nest" / "skills" / "screenrig"
            logical_skill.parent.mkdir(parents=True)
            logical_skill.symlink_to(physical / "nest" / "skills" / "screenrig", target_is_directory=True)
            expect_missing("a CLI above the symlink target is never run",
                           run(logical_skill / "scripts" / "screenrig", env()))

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
    def test_codex_registration_does_not_depend_on_other_marketplaces(self) -> None:
        node = subprocess.check_output(["node", "-p", "process.execPath"], text=True).strip()
        with tempfile.TemporaryDirectory(prefix="screenrig-codex-registry-") as temporary:
            tmp = Path(temporary)
            root = tmp / "registered plugin"
            helper = install_copy(HELPER, root / "skills/screenrig/scripts/screenrig-plugin-freshness")
            write_json(root / "cli/package.json", {"name": "screenrig", "version": "26.10.1"})
            cli = root / "cli/dist/bin.js"
            cli.parent.mkdir(parents=True)
            cli.write_text('process.stdout.write(JSON.stringify({ok:true,data:{version:"test"}})+"\\n");\n')
            host = tmp / "bin/codex"
            host.parent.mkdir()
            host.write_text(
                "#!" + node + '\n'
                'const args = process.argv.slice(2);\n'
                'require("fs").appendFileSync(process.env.TEST_HOST_CALLS, JSON.stringify(args)+"\\n");\n'
                'if (process.env.TEST_LEGACY && args.includes("--marketplace")) { process.stderr.write("unexpected argument \'--marketplace\'"); process.exit(2); }\n'
                'if (!process.env.TEST_LEGACY && (!args.includes("--marketplace") || args[args.indexOf("--marketplace")+1] !== "screenrig")) process.exit(75);\n'
                'process.stdout.write(JSON.stringify({installed:[{pluginId:"screenrig@screenrig",installed:true,enabled:process.env.TEST_ENABLED !== "0",source:{path:process.env.TEST_ROOT}}]}));\n'
            )
            host.chmod(0o755)
            calls = tmp / "host-calls.jsonl"
            env = without(FRESHNESS_VARS, PATH=f"{host.parent}{os.pathsep}{os.environ['PATH']}",
                          TEST_ROOT=str(root), TEST_HOST_CALLS=str(calls))
            command = [node, str(helper), "--host", "codex", "--run", "version"]
            result = subprocess.run(command, env=env, text=True, capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertTrue(json.loads(result.stdout)["ok"])
            self.assertEqual(json.loads(calls.read_text().splitlines()[0]),
                             ["plugin", "list", "--json", "--marketplace", "screenrig"])
            result = subprocess.run(command, env={**env, "TEST_ENABLED": "0"}, text=True,
                                    capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 78)
            self.assertEqual(json.loads(result.stdout)["data"]["action"], "install")
            result = subprocess.run(command, env={**env, "TEST_LEGACY": "1"}, text=True,
                                    capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(json.loads(calls.read_text().splitlines()[-1]), ["plugin", "list", "--json"])

    def test_directory_install_source_and_updates(self) -> None:
        """A copy from a host's plugin directory is registered, never told to
        refresh from GitHub, and passes its install source to the CLI."""
        node = subprocess.check_output(["node", "-p", "process.execPath"], text=True).strip()
        with tempfile.TemporaryDirectory(prefix="screenrig-directory-") as temporary:
            tmp = Path(temporary)
            root = tmp / "directory plugin"
            script = install_copy(HELPER, root / "skills/screenrig/scripts/screenrig-plugin-freshness")
            install_copy(LAUNCHER, script.with_name("screenrig"))
            write_json(root / "cli/package.json", {"name": "screenrig", "version": "26.10.1"})
            cli = root / "cli/dist/bin.js"
            cli.parent.mkdir(parents=True)
            cli.write_text('''const fs = require("fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_CALLS, JSON.stringify({args, source: process.env.SCREENRIG_INSTALL_SOURCE ?? null})+"\\n");
let data;
if (args.includes("version")) data = {version:"26.10.1",distribution:{kind:"plugin_bundle"}};
else if (args.includes("doctor")) data = {status:"pass", checks:[{name:"token",status:"pass"}]};
else if (args.includes("agent")) data = {status:"active"};
else if (args.includes("project")) data = {features:{screens:true}};
process.stdout.write(JSON.stringify({ok:true,data,warnings:[]})+"\\n");
''', encoding="utf-8")
            registry, marketplace, calls = tmp / "registry.json", tmp / "marketplace.json", tmp / "calls.jsonl"
            # GitHub's marketplace is ahead of what the directory has published.
            write_json(marketplace, {"plugins": [{"version": "26.11.5"}]})
            bin_dir = tmp / "bin"
            bin_dir.mkdir()
            host = bin_dir / "claude"
            host.write_text("#!" + node + '\nprocess.stdout.write(require("fs").readFileSync(process.env.TEST_REGISTRY).toString());\n')
            host.chmod(0o755)
            environment = without(FRESHNESS_VARS, PATH=f"{bin_dir}{os.pathsep}{os.environ['PATH']}", TEST_REGISTRY=str(registry),
                                  TEST_CALLS=str(calls), SCREENRIG_PUBLISHED_MARKETPLACE_URL=marketplace.as_uri())

            def run(*args):
                return subprocess.run(["node", str(script), "--host", "claude", *args],
                                      env=environment, text=True, capture_output=True, timeout=30)

            for marketplace_name, action in (("Claude-Plugins Official", "ready"), ("screenrig", "refresh")):
                calls.unlink(missing_ok=True)
                write_json(registry, [{"id": f"screenrig@{marketplace_name}", "installPath": str(root)}])
                result = run("--bootstrap", "--json")
                self.assertEqual(result.returncode, 0, result.stderr)
                data = json.loads(result.stdout)["data"]
                self.assertEqual(data["registration"], {"host": "claude", "marketplace": marketplace_name, "source": "plugin_list"})
                self.assertEqual(data["action"], action)
                if action == "ready":
                    self.assertEqual(data["freshness"]["updates_from"], marketplace_name)
                    self.assertFalse(data["freshness"]["stale"])
                result = run("--run", "version")
                self.assertEqual(result.returncode, 0, result.stderr)
                sources = {json.loads(line)["source"] for line in calls.read_text().splitlines()
                           if "version" in json.loads(line)["args"]}
                expected = "claude/claude-plugins-official" if action == "ready" else "claude/screenrig"
                self.assertIn(expected, sources)

    def test_bootstrap_registration_reuse_and_exact_command(self) -> None:
        node = subprocess.check_output(["node", "-p", "process.execPath"], text=True).strip()
        with tempfile.TemporaryDirectory(prefix="screenrig-bootstrap-") as temporary:
            tmp = Path(temporary)
            root = tmp / "registered plugin"
            script = install_copy(HELPER, root / "skills/screenrig/scripts/screenrig-plugin-freshness")
            install_copy(LAUNCHER, script.with_name("screenrig"))
            write_json(root / "cli/package.json", {"name": "screenrig", "version": "26.10.1"})
            cli = root / "cli/dist/bin.js"
            cli.parent.mkdir(parents=True)
            cli.write_text('''const fs = require("fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_CALLS, JSON.stringify(args)+"\\n");
let data, code=0;
if (args.includes("version")) data = {version:"26.10.1",distribution:{kind:"plugin_bundle"}};
else if (args.includes("doctor")) {
 if (process.env.TEST_DOCTOR_MODE === "error") {
  process.stdout.write(JSON.stringify({ok:false,error:{code:"config_invalid",detail:"Fix the selected configuration."}})+"\\n");process.exit(2);
 }
 data = {status:"warn", checks:[
  {name:"token",status:"warn",path:"first_run_enroll",next:{command:process.env.TEST_PENDING ? "screenrig agent enroll" : "screenrig agent enroll --email ADDRESS --organization NAME",reason:"Continue enrollment."}},
  {name:"api_url",status:"pass",detail:"https://api.screenrig.ai"}]};
 if (process.env.TEST_DOCTOR_MODE) {code=5;data.status="fail";data.checks.push({name:process.env.TEST_DOCTOR_MODE === "media" ? "ffmpeg" : "config_permissions",status:"fail",detail:"Synthetic missing dependency."});}
}
else if (args.includes("agent")) data = process.env.TEST_AGENT_JSON ? JSON.parse(process.env.TEST_AGENT_JSON)
 : {status:process.env.TEST_AGENT_STATE,...(process.env.TEST_AGENT_STATE === "not_enrolled" ? {path:"first_run_enroll"} : {})};
else if (args.includes("project")) data = {features:{screens:true}};
else { process.stdout.write(JSON.stringify({ok:false,error:{code:"synthetic_exit"}})+"\\n");process.exit(7); }
process.stdout.write(JSON.stringify({ok:true,data,warnings:[]})+"\\n");
process.exitCode=code;
''', encoding="utf-8")
            registry, marketplace, calls = tmp / "registry.json", tmp / "marketplace.json", tmp / "calls.jsonl"
            grok_config = tmp / "grok.toml"
            grok_config.write_text("[plugins]\ndisabled=[]\n")
            write_json(marketplace, {"plugins": [{"version": "26.10.1"}]})
            bin_dir = tmp / "bin"
            bin_dir.mkdir()
            host = bin_dir / "claude"
            host.write_text("#!"+node+'\nprocess.stdout.write(process.argv[2] === "inspect" ? JSON.stringify({configSources:{layers:[{path:process.env.TEST_GROK_CONFIG}]}}) : require("fs").readFileSync(process.env.TEST_REGISTRY).toString());\n')
            host.chmod(0o755)
            for name in ("codex", "grok"):
                install_copy(host, bin_dir / name)
            environment = without(FRESHNESS_VARS, PATH=f"{bin_dir}{os.pathsep}{os.environ['PATH']}",
                                  TEST_REGISTRY=str(registry), TEST_GROK_CONFIG=str(grok_config), TEST_CALLS=str(calls), TEST_AGENT_STATE="active",
                                  SCREENRIG_PUBLISHED_MARKETPLACE_URL=marketplace.as_uri())
            def run(*args):
                return subprocess.run(["node", str(script), "--host", "claude", *args],
                                      env=environment, text=True, capture_output=True, timeout=30)
            for entries in ([], [{"id": "screenrig@screenrig", "enabled": False, "installPath": str(root)}],
                            [{"id": "screenrig@screenrig", "installPath": str(tmp / "other")} ]):
                write_json(registry, entries)
                result = run("--bootstrap", "--json")
                self.assertEqual(json.loads(result.stdout)["data"]["action"], "install")
                self.assertFalse(calls.exists(), "Unregistered packages must not invoke any CLI")
                result = run("--run", "pair")
                self.assertEqual(result.returncode, 78)
                self.assertFalse(calls.exists())
            write_json(registry, [{"id": "screenrig@screenrig", "enabled": True, "installPath": str(root)}])
            preload = tmp / "affected-runtime.cjs"
            for version in ("22.23.3", "24.22.0", "25.9.0", "26.12.0", "26.13.0-rc.1"):
                preload.write_text('Object.defineProperty(process.versions, "node", {value: '
                                   + json.dumps(version) + '});\n')
                result = subprocess.run([node, "--require", str(preload), str(script),
                                         "--host", "claude", "--run", "version"],
                                        env=environment, text=True, capture_output=True, timeout=30)
                self.assertEqual(result.returncode, 69, result.stderr)
                self.assertFalse(calls.exists(), "Affected runtimes must not invoke the bundled CLI")
            result = run("--bootstrap", "--json", "--config", str(tmp / "customer-config.json"))
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)["data"]
            self.assertEqual(data["action"], "ready")
            self.assertEqual(data["registration"], {"host": "claude", "marketplace": "screenrig", "source": "plugin_list"})
            self.assertEqual(data["launcher"], str(script.with_name("screenrig")))
            recorded = [json.loads(line) for line in calls.read_text().splitlines()]
            self.assertFalse(any("enroll" in args for args in recorded))
            for args in recorded:
                if "doctor" in args or "agent" in args or "project" in args:
                    self.assertEqual(args[-2:], ["--config", str(tmp / "customer-config.json")])
            environment["TEST_AGENT_STATE"] = "not_enrolled"
            result = run("--bootstrap", "--json")
            self.assertEqual(json.loads(result.stdout)["data"]["action"], "enroll")
            for state, action in (
                ({"status":"disconnected","credential_accepted":False,"local_cleanup_required":True,
                  "next":{"command":"screenrig agent disconnect --yes","reason":"Clean up rejected credential."}}, "reconnect"),
                ({"status":"connecting","next":{"command":"screenrig agent status","reason":"Continue pending connection."}}, "resume"),
                ({"status":"connecting","login_id":"login_AAAAAAAAAAAAAAAAAAAAAA",
                  "next":{"command":"screenrig login --resume login_AAAAAAAAAAAAAAAAAAAAAA",
                          "argv":["login","--resume","login_AAAAAAAAAAAAAAAAAAAAAA"],
                          "reason":"After the person approves the sign-in, this stores its tokens."}}, "resume"),
                ({"status":"unknown"}, "reconnect"),
            ):
                environment["TEST_AGENT_JSON"] = json.dumps(state)
                result = run("--bootstrap", "--json")
                data = json.loads(result.stdout)["data"]
                self.assertEqual(data["action"], action)
                if "next" in state: self.assertEqual(data["next"], state["next"])
            environment.pop("TEST_AGENT_JSON")
            environment["TEST_PENDING"] = "1"
            result = run("--bootstrap", "--json")
            self.assertEqual(json.loads(result.stdout)["data"]["action"], "resume")
            self.assertEqual(json.loads(result.stdout)["data"]["next"]["command"], "screenrig agent enroll")
            environment.pop("TEST_PENDING")
            environment["TEST_DOCTOR_MODE"] = "media"
            result = run("--bootstrap", "--json")
            self.assertEqual(result.returncode, 0)
            self.assertEqual(json.loads(result.stdout)["data"]["action"], "enroll")
            self.assertEqual(json.loads(result.stdout)["warnings"][0]["code"], "media_tools_missing")
            environment["TEST_DOCTOR_MODE"] = "core"
            result = run("--bootstrap", "--json")
            self.assertEqual(result.returncode, 5)
            self.assertEqual(json.loads(result.stdout)["data"]["action"], "repair")
            environment["TEST_DOCTOR_MODE"] = "error"
            result = run("--bootstrap", "--json")
            self.assertEqual(result.returncode, 2)
            self.assertEqual(json.loads(result.stdout)["error"], {"code":"config_invalid","detail":"Fix the selected configuration."})
            environment.pop("TEST_DOCTOR_MODE")
            for name, entries in (
                ("codex", {"installed":[{"pluginId":"screenrig@screenrig","enabled":True,"installed":True,"source":{"path":str(root)}}]}),
                ("grok", [{"status":"installed","name":"screenrig","path":str(root)}]),
            ):
                write_json(registry, entries)
                result = subprocess.run(["node", str(script), "--host", name, "--bootstrap", "--json"],
                                        env=environment, text=True, capture_output=True, timeout=30)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(result.stdout)["data"]["registration"]["host"], name)
            for policy in ('[plugins]\ndisabled=["screenrig"]', "[plugins]\ndisabled=[\n# ] policy\n'user/id/screenrig',\n]", '[plugins]\ndisabled=[broken]'):
                grok_config.write_text(policy)
                before = calls.read_text()
                result = subprocess.run(["node", str(script), "--host", "grok", "--run", "version"], env=environment, text=True, capture_output=True, timeout=30)
                self.assertEqual(result.returncode, 78)
                self.assertEqual(calls.read_text(), before)
            grok_config.write_text('[plugins]\ndisabled=["another"]')
            write_json(registry, [{"id":"screenrig@screenrig","installPath":str(root)}])
            # An explicitly selected missing host must not borrow another host's root.
            (bin_dir / "codex").unlink()
            isolated = {**environment, "PATH": str(bin_dir), "CLAUDE_PLUGIN_ROOT": str(root)}
            result = subprocess.run([node, str(script), "--host", "codex", "--run", "synthetic"],
                                    env=isolated, text=True, capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 78, result.stderr)
            result = run("--config", str(tmp / "customer-config.json"), "--run", "synthetic", "a value with spaces")
            self.assertEqual(result.returncode, 7)
            self.assertEqual(json.loads(result.stdout)["error"]["code"], "synthetic_exit")
            self.assertEqual(json.loads(calls.read_text().splitlines()[-1]),
                             ["synthetic", "a value with spaces", "--config", str(tmp / "customer-config.json")])

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
            # The release stamps the plugin version into the bundled CLI package.
            write_json(root / "cli" / "package.json", {"name": "screenrig", "version": version})

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
            # install location, and with no bundled CLI anywhere it says so
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
            expect("environment root without a bundled CLI",
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
    def test_inventory_covers_every_version_bearing_manifest(self):
        files = json.loads((ROOT / "release-version-files.json").read_text())
        self.assertEqual(len(files), len(set(files)))
        candidates = [ROOT / ".claude-plugin" / "marketplace.json", ROOT / ".agents" / "plugins" / "marketplace.json"]
        candidates += list((ROOT / "plugins" / "screenrig").rglob("*plugin.json"))
        candidates += [ROOT / "plugins" / "screenrig" / "cli" / "package.json"]
        for path in candidates:
            versioned = bool(re.search(r'"version"\s*:', path.read_text()))
            self.assertEqual(str(path.relative_to(ROOT)) in files, versioned, str(path))


    def test_stamp_reports_one_version_everywhere(self) -> None:
        # Freshness compares the installed plugin and bundled CLI against the
        # published CalVer, so a bundled CLI left behind would look stale forever.
        with tempfile.TemporaryDirectory(prefix="screenrig-plugin-calver-") as temporary:
            tmp = Path(temporary)
            plugin_root = tmp / "screenrig"
            marketplace = tmp / "marketplace.json"
            write_json(plugin_root / "cli" / "package.json", {"name": "screenrig", "version": "26.09.6"})
            write_json(plugin_root / "plugin.json", {"name": "screenrig", "version": "26.09.6"})
            write_json(plugin_root / "openclaw.plugin.json", {"id": "screenrig", "version": "26.09.6"})
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
                         plugin_root / ".codex-plugin" / "plugin.json", plugin_root / "plugin.json",
                         plugin_root / "openclaw.plugin.json"):
                self.assertEqual(json.loads(path.read_text())["version"], "26.09.7", path.name)


# Skill commands must exist in the bundled CLI.
SKILL_DOCS = sorted((ROOT / "skills").rglob("*.md"))
BUNDLED_LAUNCHER = ROOT / "plugins" / "screenrig" / "skills" / "screenrig" / "scripts" / "screenrig"
REQUIRED_COMMANDS = ("media generate", "media download")
validator = load_script("skill_validator", "validate-plugin.py")


class SkillCommandTests(unittest.TestCase):
    def run_cli(self, *args: str) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory(prefix="screenrig-skill-commands-") as temporary:
            return subprocess.run(
                [str(BUNDLED_LAUNCHER), *args], cwd=ROOT, text=True, capture_output=True, check=False,
                env={"PATH": os.environ.get("PATH", ""), "XDG_CONFIG_HOME": str(Path(temporary) / "config")},
            )

    def test_required_commands_exist_in_bundled_cli(self) -> None:
        # validate-plugin.py judges every command path the skills write; this
        # keeps the commands the skills cannot do without.
        errors: list[str] = []
        validator.errors.clear()
        inventory = validator.bundled_command_inventory() or []
        errors.extend(validator.errors)
        for command in REQUIRED_COMMANDS:
            if not any(command in text for text in (p.read_text(encoding="utf-8") for p in SKILL_DOCS)):
                errors.append(f"skill docs do not teach {command}")
            if command not in inventory:
                errors.append(f"bundled CLI inventory is missing {command}")

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


class TaughtSurfaceTests(unittest.TestCase):
    """Skills may write only command paths and MCP tool names that exist (validate-plugin.py)."""

    TREE = validator.command_tree([
        "screen show", "screen assign", "screen reload", "screen takeover set", "screen takeover clear",
        "playlist validate", "playlist get", "ads networks list", "ads networks show", "login", "help",
    ])

    def problems(self, markdown: str) -> list[tuple[int, str]]:
        return validator.taught_command_errors(markdown, self.TREE)

    def test_existing_paths_pass(self) -> None:
        document = (
            "Run `screenrig screen show SCREEN_ID`, `screen assign|reload`, `screen takeover` and\n"
            "`ads networks list|show`; `screenrig login --no-wait`, `screenrig help --all`, `screenrig help screen show`.\n"
            "Wrapped: `playlist\nvalidate FILE`.\n"
            "| Group | First |\n| --- | --- |\n| `screen` | `screen takeover set\\|clear` |\n"
            "```sh\n$ screenrig playlist get ID   # then `screen show`\n```\n"
            "1. Step:\n\n   ```sh\n   screenrig screen show ID\n   ```\n"
        )
        self.assertEqual(self.problems(document), [])

    def test_unknown_paths_fail_with_their_line(self) -> None:
        cases = {
            "`screenrig screen frobnicate ID`": "screen frobnicate",
            "`screen frobnicate`": "screen frobnicate",
            "`screenrig nonsense`": "nonsense",
            "`screenrig help screen frobnicate`": "screen frobnicate",
            "`screen assign|frobnicate`": "screen frobnicate",
            "`screen takeover frobnicate`": "screen takeover frobnicate",
            "`ads networks list|show|frobnicate`": "ads networks frobnicate",
            "`playlist\nfrobnicate FILE`": "playlist frobnicate",
            "| `screen takeover set\\|frobnicate` |": "screen takeover frobnicate",
            "```sh\n$ screenrig screen frobnicate\n```": "screen frobnicate",
            "1. Step:\n\n   ```sh\n   screenrig screen frobnicate\n   ```": "screen frobnicate",
        }
        for document, expected in cases.items():
            with self.subTest(document=document):
                problems = self.problems("Intro.\n\n" + document)
                self.assertEqual(len(problems), 1, problems)
                self.assertTrue(problems[0][1].startswith(f"`{expected}` is not a screenrig command"), problems)
        self.assertEqual(self.problems("Intro.\n\nSee `playlist\nfrobnicate FILE` now.")[0][0], 3)
        self.assertIn("it has assign, reload, show, takeover", self.problems("`screen frobnicate`")[0][1])
        self.assertIn("did you mean show?", self.problems("`screen shows`")[0][1])

    def test_what_is_not_judged(self) -> None:
        for document in (
            "`screenrig` names the product, and screen frobnicate is prose",
            "After campaign, `update|frobnicate|pause` leaves out its group.",
            "`screen show SCREEN_ID --frobnicate`, `screen show frobnicate`, `screenrig login Frobnicate`",
            "`claude plugin frobnicate`, `screenrig-plugin-freshness --frobnicate`, `Screen frobnicate`",
            "```json\n{\"screenrig\": \"screen frobnicate\"}\n```",
            "```html\nscreen frobnicate\n```",
            "```sh\nscreen frobnicate\n```",
        ):
            with self.subTest(document=document):
                self.assertEqual(self.problems(document), [])

    def test_tool_names(self) -> None:
        tools = {"screenrig_screen_list", "screenrig_screen_get"}
        document = (
            "Call `screenrig_screen_list`, and `SCREENRIG_CONFIG`, `scripts/screenrig_view.py`, `screenrig_views.json`,\n"
            "`screenrig-views`, `screenrig_screen_listing` and `screenrig_gone`.\n"
            "```json\n{\"screenrig_screen_get\": {}, \"screenrig_screen_frob\": {}}\n```\n"
        )
        self.assertEqual(
            [(line, problem.split("`")[1]) for line, problem in validator.taught_tool_errors(document, tools)],
            [(2, "screenrig_screen_listing"), (2, "screenrig_gone"), (4, "screenrig_screen_frob")],
        )

    def test_validator_reads_skills_against_the_cli_and_the_vendored_tools(self) -> None:
        with tempfile.TemporaryDirectory(prefix="screenrig-taught-surface-") as temporary:
            root = Path(temporary) / "plugin"
            (root / "skills" / "screenrig").mkdir(parents=True)
            (root / "scripts").mkdir()
            (root / "skills" / "screenrig" / "SKILL.md").write_text(
                "Run `screenrig screen publish ID`, then `screen frobnicate`.\n"
                "Call `screenrig_screen_list` and `screenrig_gone`.\n", encoding="utf-8")
            tools = root / "scripts" / "mcp-tools.json"
            with patch.object(validator, "ROOT", root):
                tools.write_text(json.dumps({"schema": "screenrig.mcp-tools/v1", "tools": ["screenrig_screen_list"]}), encoding="utf-8")
                validator.errors.clear()
                validator.check_taught_surface()
                self.assertEqual(len(validator.errors), 2, validator.errors)
                self.assertTrue(validator.errors[0].startswith(
                    "skills/screenrig/SKILL.md:1: `screen frobnicate` is not a screenrig command"))
                self.assertTrue(validator.errors[1].startswith("skills/screenrig/SKILL.md:2: names MCP tool `screenrig_gone`"))
                # A missing or malformed list is a failure, never a skipped check.
                for write in (lambda: tools.unlink(),
                              lambda: tools.write_text("{}", encoding="utf-8"),
                              lambda: tools.write_text(json.dumps({"schema": "screenrig.mcp-tools/v1", "tools": ["Screen List"]}), encoding="utf-8")):
                    write()
                    validator.errors.clear()
                    validator.check_taught_surface()
                    self.assertEqual(len(validator.errors), 2, validator.errors)
                    self.assertIn("scripts/mcp-tools.json", validator.errors[0])
                    self.assertTrue(validator.errors[1].startswith(
                        "skills/screenrig/SKILL.md:1: `screen frobnicate` is not a screenrig command"), validator.errors)
        validator.errors.clear()


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
                         {"ajv", "ajv-formats", "commander"})

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


class MCPConnectionTests(unittest.TestCase):
    def test_portable_submission_and_overlay_stay_aligned(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            builder.copy_docs(root)
            legacy_codex_mcp = root / ".codex-plugin/mcp.json"
            legacy_codex_mcp.parent.mkdir(parents=True)
            legacy_codex_mcp.write_text("{}\n")
            builder.emit_manifests(root, builder.METADATA, "26.10.0-dev")
            portable = json.loads((root / "plugin.json").read_text())
            overlay = json.loads((root / ".codex-plugin/plugin.json").read_text())
            public = portable["extensions"]["com.openai"]
            self.assertEqual(portable["version"], overlay["version"])
            self.assertEqual(public["interface"], overlay["interface"])
            self.assertFalse({"skills", "mcpServers", "apps", "interface"} & portable.keys())
            self.assertEqual(public["publication"]["countries"], ["CA", "US"])
            self.assertTrue(public["review"]["commerce"])
            self.assertEqual(len(public["review"]["test_cases"]["positive"]), 5)
            self.assertEqual(len(public["review"]["test_cases"]["negative"]), 3)
            interface = public["interface"]
            self.assertLessEqual(len(interface["shortDescription"]), 30)
            self.assertLessEqual(len(interface["defaultPrompt"]), 3)
            self.assertTrue(all(0 < len(p) <= 128 and "\n" not in p for p in interface["defaultPrompt"]))
            for field in ("websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"):
                self.assertTrue(interface[field].startswith("https://screenrig.ai/"))
            for field in ("logo", "composerIcon"):
                icon = root / interface[field]
                self.assertTrue(icon.resolve().is_relative_to(root.resolve()))
                data = icon.read_bytes()
                self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
                self.assertEqual(int.from_bytes(data[16:20], "big"), 512)
                self.assertEqual(int.from_bytes(data[20:24], "big"), 512)
            mcp = json.loads((root / "mcp.json").read_text())["mcpServers"]["screenrig-views"]
            codex = json.loads((root / ".mcp.json").read_text())["mcpServers"]["screenrig-views"]
            openclaw = json.loads((root / "openclaw.plugin.json").read_text())
            self.assertFalse(legacy_codex_mcp.exists())
            self.assertEqual(
                {path.name for path in (root / ".codex-plugin").iterdir()},
                {"plugin.json"},
            )
            self.assertEqual(mcp["url"], codex["url"])
            self.assertEqual(openclaw["version"], portable["version"])
            self.assertEqual(openclaw["skills"], ["./skills/screenrig", "./skills/screenrig-view-bridge"])
            self.assertEqual(openclaw["mcpServers"]["screenrig-views"], {
                "url": mcp["url"], "transport": "streamable-http", "auth": "oauth",
                "oauth": {"scope": "access:manage screens content playlists reports"},
            })
            self.assertEqual(mcp, {
                "type": "streamable-http",
                "url": "https://api.screenrig.ai/mcp",
            })
            self.assertEqual(codex["scopes"],
                             ["access:manage", "screens", "content", "playlists", "reports"])

    def test_skill_dependency_matches_registered_server(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            builder.emit_manifests(root, builder.METADATA, builder.version())
            servers = json.loads((root / ".mcp.json").read_text())["mcpServers"]
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
                    self.assertEqual(manifest["mcpServers"], "./.mcp.json")
                    manifest = json.loads((root / ".mcp.json").read_text())
                server = manifest["mcpServers"]["screenrig-views"]
                self.assertEqual(server["url"], "https://api.screenrig.ai/mcp")
                self.assertEqual(server["type"], "http")
                scopes = server["scopes"] if host == "codex" else server["oauth"]["scopes"].split()
                self.assertEqual(scopes, ["access:manage", "screens", "content", "playlists", "reports"])
                self.assertNotIn("identity", scopes)
                self.assertEqual(set(server), {"type", "url", "scopes" if host == "codex" else "oauth"})
                for skill_root in (ROOT, ROOT / "plugins/screenrig"):
                    installation = (skill_root / "skills/screenrig/references/installation.md").read_text()
                    login_scopes = re.search(r'--scopes ([^\s`]+)', installation).group(1).split(',')
                    self.assertEqual(login_scopes, scopes,
                                     "Manual OAuth login must retain screenshot capture permission")
        for root in (ROOT, ROOT / "plugins/screenrig"):
            self.assertFalse((root / "skills/screenrig/scripts/screenrig-mcp-auth.mjs").exists())

    def test_validator_rejects_credential_and_endpoint_overrides(self):
        validator = load_script("connection_validator", "validate-plugin.py")
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            builder.emit_manifests(root, builder.METADATA, builder.version())
            manifest_path = root / "mcp.json"
            original = json.loads(manifest_path.read_text())
            for field, value in (("headers", {"Authorization": "synthetic"}),
                                 ("url", "https://wrong.example/mcp"),
                                 ("scopes", ["access:read", "screens", "content", "playlists", "reports"]),
                                 ("command", "credential-helper")):
                manifest = copy.deepcopy(original)
                manifest["mcpServers"]["screenrig-views"][field] = value
                write_json(manifest_path, manifest)
                validator.errors.clear()
                with patch.object(validator, "PLUGIN", root):
                    validator.check_no_alternate_surfaces(None)
                self.assertTrue(any("host-managed OAuth" in error for error in validator.errors))


class ViewBridgeTests(unittest.TestCase):
    def render(self, seed: dict) -> tuple[dict, str]:
        with tempfile.TemporaryDirectory(prefix="screenrig-view-bridge-test-") as temporary:
            root = Path(temporary)
            app = root / "app.html"
            app.write_text("<script>/* ui/initialize */</script>\n", encoding="utf-8")
            seed_path = root / "seed.json"
            write_json(seed_path, seed)
            output = root / "view.html"
            result = subprocess.run(
                ["node", str(VIEW_BRIDGE), "--app", str(app), "--seed", str(seed_path),
                 "--output", str(output)],
                text=True, capture_output=True, check=False,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            return json.loads(result.stdout), output.read_text(encoding="utf-8")

    def embedded_seed(self, page: str) -> dict:
        match = re.search(r"var SEED = (.*);\n  var frame", page)
        self.assertIsNotNone(match)
        return json.loads(match.group(1))

    def test_cli_envelopes_are_normalized_for_the_view(self):
        screen = {"id": "scr_TEST", "label": "Test", "state": "active", "online": True}
        envelope, page = self.render({
            "tools": {"screenrig_screen_list": {
                "ok": True, "data": {"items": [screen], "next_cursor": None}, "warnings": [],
            }},
            "by_id": {"scr_TEST": {"ok": True, "data": screen, "warnings": []}},
            "images": {},
        })
        self.assertTrue(envelope["ok"])
        seed = self.embedded_seed(page)
        self.assertEqual(seed["tools"]["screenrig_screen_list"], {
            "structuredContent": {"items": [screen], "next_cursor": None},
        })
        self.assertEqual(seed["by_id"]["scr_TEST"], screen)

    def test_collection_contract_includes_media_detail_and_thumbnail(self):
        skill = (ROOT / "skills/screenrig-view-bridge/SKILL.md").read_text(encoding="utf-8")
        self.assertIn("`screenrig_media_get`", skill)
        self.assertIn("`screenrig_media_thumbnail`", skill)


if __name__ == "__main__":
    unittest.main(defaultTest=["LauncherTests", "FreshnessTests", "CalVerTests", "SkillCommandTests",
                               "TaughtSurfaceTests", "DocsOnlyTests", "DependencyBoundaryTests", "MCPConnectionTests",
                               "ViewBridgeTests"])
