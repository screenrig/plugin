#!/usr/bin/env python3
"""Deterministic checks for the plugin detect-and-refresh helper."""

from __future__ import annotations

import json
import os
import stat
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import pathname2url


ROOT = Path(__file__).resolve().parent.parent
HELPER = ROOT / "skills" / "screenrig" / "scripts" / "screenrig-plugin-freshness"
PLUGIN_ROOT_VARS = (
    "SCREENRIG_PLUGIN_ROOT",
    "GROK_PLUGIN_ROOT",
    "CODEX_PLUGIN_ROOT",
    "CLAUDE_PLUGIN_ROOT",
    "PLUGIN_ROOT",
    "SCREENRIG_PUBLISHED_MARKETPLACE_URL",
)
DEFAULT_MARKETPLACE_URL = (
    "https://raw.githubusercontent.com/screenrig/plugin/main/.claude-plugin/marketplace.json"
)


def file_url(path: Path) -> str:
    return urljoin("file:", pathname2url(str(path.resolve())))


def clean_env(**extra: str) -> dict[str, str]:
    env = {key: value for key, value in os.environ.items() if key not in PLUGIN_ROOT_VARS}
    env.update(extra)
    return env


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def install_helper(destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(HELPER.read_bytes())
    destination.chmod(destination.stat().st_mode | stat.S_IXUSR)
    return destination


def write_stub_screenrig(destination: Path, version: str) -> None:
    envelope = json.dumps({"ok": True, "data": {"version": version}, "warnings": []})
    destination.write_text(f"#!/bin/sh\nprintf '%s\\n' '{envelope}'\n", encoding="utf-8")
    destination.chmod(destination.stat().st_mode | stat.S_IXUSR)


def write_plugin_tree(root: Path, plugin_version: str) -> None:
    write_json(root / ".claude-plugin" / "plugin.json", {"name": "screenrig", "version": plugin_version})
    write_json(root / ".codex-plugin" / "plugin.json", {"name": "screenrig", "version": plugin_version})


def write_marketplace(path: Path, version: str | None) -> None:
    entry: dict[str, object] = {"name": "screenrig"}
    if version is not None:
        entry["version"] = version
    write_json(path, {"name": "screenrig", "plugins": [entry]})


def run_helper(script: Path, env: dict[str, str], args: list[str] | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(script), *(args if args is not None else ["--json"])],
        cwd=script.parent,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def expect_success(
    errors: list[str],
    label: str,
    result: subprocess.CompletedProcess[str],
    *,
    action: str,
    stale: bool,
    published: str | None,
    plugin: str | None,
    cli: str | None,
    warning_code: str | None = None,
) -> None:
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
    if data.get("action") != action:
        errors.append(f"{label}: action {data.get('action')!r}, expected {action!r}")
    if data.get("stale") is not stale:
        errors.append(f"{label}: stale {data.get('stale')!r}, expected {stale!r}")
    if data.get("published_version") != published:
        errors.append(f"{label}: published_version {data.get('published_version')!r}, expected {published!r}")
    if data.get("installed_plugin_version") != plugin:
        errors.append(f"{label}: installed_plugin_version {data.get('installed_plugin_version')!r}, expected {plugin!r}")
    if data.get("installed_cli_version") != cli:
        errors.append(f"{label}: installed_cli_version {data.get('installed_cli_version')!r}, expected {cli!r}")
    if warning_code is None:
        if warnings not in ([], None):
            errors.append(f"{label}: unexpected warnings {warnings!r}")
        return
    if not isinstance(warnings, list) or not any(
        isinstance(item, dict) and item.get("code") == warning_code for item in warnings
    ):
        errors.append(f"{label}: missing warning {warning_code!r} in {warnings!r}")


def main() -> int:
    errors: list[str] = []
    if not HELPER.is_file():
        print("canonical plugin-freshness helper is missing", file=sys.stderr)
        return 1
    text = HELPER.read_text(encoding="utf-8")
    for fact in (
        DEFAULT_MARKETPLACE_URL,
        "plugins[0].version",
        "continue_installed",
        "published_version_unavailable",
        "GROK_PLUGIN_ROOT",
        "CLAUDE_PLUGIN_ROOT",
        "CODEX_PLUGIN_ROOT",
    ):
        if fact not in text:
            errors.append(f"canonical helper is missing fact: {fact}")
    if "SCREENRIG_TOKEN" in text or "npm i -g" in text:
        errors.append("canonical helper must not mention tokens or a global npm install")

    with tempfile.TemporaryDirectory(prefix="screenrig-plugin-freshness-") as temporary:
        tmp = Path(temporary)
        scripts = tmp / "scripts"
        helper = install_helper(scripts / "screenrig-plugin-freshness")
        plugin_root = tmp / "plugin"
        marketplace = tmp / "marketplace.json"
        write_plugin_tree(plugin_root, "26.09.1")
        write_stub_screenrig(scripts / "screenrig", "26.09.1")
        write_marketplace(marketplace, "26.09.1")
        current_env = clean_env(
            SCREENRIG_PLUGIN_ROOT=str(plugin_root),
            SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(marketplace),
        )
        expect_success(
            errors,
            "current pair",
            run_helper(helper, current_env),
            action="keep",
            stale=False,
            published="26.09.1",
            plugin="26.09.1",
            cli="26.09.1",
        )

        write_plugin_tree(plugin_root, "0.1.2")
        write_stub_screenrig(scripts / "screenrig", "0.1.2")
        expect_success(
            errors,
            "stale 0.1.2 vs 26.09.1",
            run_helper(helper, current_env),
            action="refresh",
            stale=True,
            published="26.09.1",
            plugin="0.1.2",
            cli="0.1.2",
        )

        write_plugin_tree(plugin_root, "26.09.1")
        write_stub_screenrig(scripts / "screenrig", "0.1.0")
        expect_success(
            errors,
            "stale CLI only",
            run_helper(helper, current_env),
            action="refresh",
            stale=True,
            published="26.09.1",
            plugin="26.09.1",
            cli="0.1.0",
        )

        # Released installs compare as CalVer, not raw strings: an installed
        # release equal to the published release is fresh, an older release is
        # stale, and a `-dev` install is below any published release.
        release_marketplace = tmp / "release-marketplace.json"
        write_marketplace(release_marketplace, "26.09.7")
        release_env = clean_env(
            SCREENRIG_PLUGIN_ROOT=str(plugin_root),
            SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(release_marketplace),
        )
        write_plugin_tree(plugin_root, "26.09.7")
        write_stub_screenrig(scripts / "screenrig", "26.09.7")
        expect_success(
            errors,
            "release install equal to published",
            run_helper(helper, release_env),
            action="keep",
            stale=False,
            published="26.09.7",
            plugin="26.09.7",
            cli="26.09.7",
        )

        write_plugin_tree(plugin_root, "26.08.3")
        write_stub_screenrig(scripts / "screenrig", "26.08.3")
        expect_success(
            errors,
            "older release install",
            run_helper(helper, release_env),
            action="refresh",
            stale=True,
            published="26.09.7",
            plugin="26.08.3",
            cli="26.08.3",
        )

        write_plugin_tree(plugin_root, "26.09.0-dev")
        write_stub_screenrig(scripts / "screenrig", "26.09.0-dev")
        expect_success(
            errors,
            "dev install against a release",
            run_helper(helper, release_env),
            action="refresh",
            stale=True,
            published="26.09.7",
            plugin="26.09.0-dev",
            cli="26.09.0-dev",
        )

        dev_marketplace = tmp / "dev-marketplace.json"
        write_marketplace(dev_marketplace, "26.09.0-dev")
        dev_env = clean_env(
            SCREENRIG_PLUGIN_ROOT=str(plugin_root),
            SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(dev_marketplace),
        )
        # The canonical marketplace installs git main, which publishes the dev
        # version between releases: a dev install of that month is current, and
        # only an earlier month's dev build is stale.
        write_plugin_tree(plugin_root, "26.09.0-dev")
        write_stub_screenrig(scripts / "screenrig", "26.09.0-dev")
        expect_success(
            errors,
            "dev install against dev main",
            run_helper(helper, dev_env),
            action="keep",
            stale=False,
            published="26.09.0-dev",
            plugin="26.09.0-dev",
            cli="26.09.0-dev",
        )
        write_plugin_tree(plugin_root, "26.08.0-dev")
        write_stub_screenrig(scripts / "screenrig", "26.08.0-dev")
        expect_success(
            errors,
            "earlier dev install against dev main",
            run_helper(helper, dev_env),
            action="refresh",
            stale=True,
            published="26.09.0-dev",
            plugin="26.08.0-dev",
            cli="26.08.0-dev",
        )

        write_plugin_tree(plugin_root, "26.09.7")
        write_stub_screenrig(scripts / "screenrig", "26.09.7")
        expect_success(
            errors,
            "release install against dev main",
            run_helper(helper, dev_env),
            action="keep",
            stale=False,
            published="26.09.0-dev",
            plugin="26.09.7",
            cli="26.09.7",
        )

        unavailable_env = clean_env(
            SCREENRIG_PLUGIN_ROOT=str(plugin_root),
            SCREENRIG_PUBLISHED_MARKETPLACE_URL="http://127.0.0.1:1/.claude-plugin/marketplace.json",
        )
        expect_success(
            errors,
            "published unavailable",
            run_helper(helper, unavailable_env),
            action="continue_installed",
            stale=False,
            published=None,
            plugin="26.09.7",
            cli="26.09.7",
            warning_code="published_version_unavailable",
        )

        # F-20260924-07: with no plugin root in the environment the helper reads
        # its own install location, and with no plugin manifest anywhere it says
        # so instead of reporting a refresh that can never converge.
        installed_root = tmp / "installed" / "screenrig"
        write_plugin_tree(installed_root, "26.09.0-dev")
        installed_scripts = installed_root / "skills" / "screenrig" / "scripts"
        installed_helper = install_helper(installed_scripts / "screenrig-plugin-freshness")
        write_stub_screenrig(installed_scripts / "screenrig", "26.09.0-dev")
        expect_success(
            errors,
            "plugin root from the helper's own path",
            run_helper(installed_helper, clean_env(SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(dev_marketplace))),
            action="keep",
            stale=False,
            published="26.09.0-dev",
            plugin="26.09.0-dev",
            cli="26.09.0-dev",
        )
        loose_env = clean_env(SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(dev_marketplace))
        expect_success(
            errors,
            "no plugin root",
            run_helper(helper, loose_env),
            action="not_installed",
            stale=False,
            published=None,
            plugin=None,
            cli="26.09.7",
            warning_code="plugin_not_installed",
        )
        expect_success(
            errors,
            "environment root without a plugin manifest",
            run_helper(helper, clean_env(SCREENRIG_PLUGIN_ROOT=str(tmp / "scripts"), SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(dev_marketplace))),
            action="not_installed",
            stale=False,
            published=None,
            plugin=None,
            cli="26.09.7",
            warning_code="plugin_not_installed",
        )

        missing_json = run_helper(helper, current_env, args=[])
        if missing_json.returncode != 2:
            errors.append(f"missing --json: exit {missing_json.returncode}, expected 2")

        checkout_root = ROOT / "plugins" / "screenrig"
        checkout_marketplace = ROOT / ".claude-plugin" / "marketplace.json"
        if checkout_root.is_dir() and checkout_marketplace.is_file():
            # The UAT run: the packaged helper with no plugin root in the
            # environment, against this checkout's own marketplace. It must find
            # its plugin from its own path and converge; the source copy under
            # skills/ belongs to no installed plugin and must not ask to refresh.
            for label, script, expected in (
                ("packaged checkout helper", checkout_root / "skills" / "screenrig" / "scripts" / "screenrig-plugin-freshness", "keep"),
                ("source checkout helper", HELPER, "not_installed"),
            ):
                checkout = subprocess.run(
                    ["node", str(script), "--json"],
                    cwd=ROOT,
                    env=clean_env(SCREENRIG_PUBLISHED_MARKETPLACE_URL=file_url(checkout_marketplace)),
                    text=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    check=False,
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

    if errors:
        print("plugin-freshness helper checks failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("plugin-freshness helper checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
