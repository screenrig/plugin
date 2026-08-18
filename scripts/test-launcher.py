#!/usr/bin/env python3
"""Deterministic checks for the package-relative ScreenRig launcher."""

from __future__ import annotations

import os
import stat
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
LAUNCHER = ROOT / "skills" / "screenrig" / "scripts" / "screenrig"
MISSING_MESSAGE = (
    "ScreenRig CLI is missing; reinstall the ScreenRig plugin, or from a "
    "source checkout build cli/dist/bin.js."
)
PLUGIN_ROOT_VARS = (
    "GROK_PLUGIN_ROOT",
    "SCREENRIG_PLUGIN_ROOT",
    "CLAUDE_PLUGIN_ROOT",
    "CODEX_PLUGIN_ROOT",
)


def write_stub(path: Path, marker: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f'process.stdout.write("{marker}\\n");\n', encoding="utf-8")


def install_launcher(destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(LAUNCHER.read_bytes())
    destination.chmod(destination.stat().st_mode | stat.S_IXUSR)
    return destination


def clean_env(**extra: str) -> dict[str, str]:
    env = {key: value for key, value in os.environ.items() if key not in PLUGIN_ROOT_VARS}
    env.update(extra)
    return env


def run_launcher(script: Path, env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [str(script), "probe"],
        cwd=script.parent,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def expect(errors: list[str], label: str, result: subprocess.CompletedProcess[str], *, stdout: str, code: int = 0) -> None:
    if result.returncode != code:
        errors.append(f"{label}: exit {result.returncode}, expected {code}")
    if result.stdout != stdout:
        errors.append(f"{label}: unexpected stdout {result.stdout!r}")
    if result.stderr:
        errors.append(f"{label}: stderr must stay empty on this path")


def main() -> int:
    errors: list[str] = []
    if not LAUNCHER.is_file():
        print("canonical launcher is missing", file=sys.stderr)
        return 1
    text = LAUNCHER.read_text(encoding="utf-8")
    for fact in (
        "../../../cli/dist/bin.js",
        "GROK_PLUGIN_ROOT",
        "SCREENRIG_PLUGIN_ROOT",
        "CLAUDE_PLUGIN_ROOT",
        "CODEX_PLUGIN_ROOT",
        "pwd -P",
        MISSING_MESSAGE,
    ):
        if fact not in text:
            errors.append(f"canonical launcher is missing fact: {fact}")
    if "SCREENRIG_CLI" in text:
        errors.append("canonical launcher must not add a SCREENRIG_CLI override")

    with tempfile.TemporaryDirectory(prefix="screenrig-launcher-") as temporary:
        tmp = Path(temporary)

        bundle = tmp / "bundle"
        write_stub(bundle / "cli" / "dist" / "bin.js", "bundle")
        write_stub(tmp / "env-grok" / "cli" / "dist" / "bin.js", "grok")
        launcher = install_launcher(bundle / "skills" / "screenrig" / "scripts" / "screenrig")
        expect(
            errors,
            "bundle-relative wins",
            run_launcher(
                launcher,
                clean_env(GROK_PLUGIN_ROOT=str(tmp / "env-grok")),
            ),
            stdout="bundle\n",
        )

        env_root = tmp / "env-only"
        write_stub(env_root / "grok" / "cli" / "dist" / "bin.js", "grok")
        write_stub(env_root / "screenrig" / "cli" / "dist" / "bin.js", "screenrig")
        write_stub(env_root / "claude" / "cli" / "dist" / "bin.js", "claude")
        write_stub(env_root / "codex" / "cli" / "dist" / "bin.js", "codex")
        env_launcher = install_launcher(env_root / "skills" / "screenrig" / "scripts" / "screenrig")
        expect(
            errors,
            "GROK_PLUGIN_ROOT before other roots",
            run_launcher(
                env_launcher,
                clean_env(
                    GROK_PLUGIN_ROOT=str(env_root / "grok"),
                    SCREENRIG_PLUGIN_ROOT=str(env_root / "screenrig"),
                    CLAUDE_PLUGIN_ROOT=str(env_root / "claude"),
                    CODEX_PLUGIN_ROOT=str(env_root / "codex"),
                ),
            ),
            stdout="grok\n",
        )
        expect(
            errors,
            "SCREENRIG_PLUGIN_ROOT after empty GROK",
            run_launcher(
                env_launcher,
                clean_env(
                    SCREENRIG_PLUGIN_ROOT=str(env_root / "screenrig"),
                    CLAUDE_PLUGIN_ROOT=str(env_root / "claude"),
                    CODEX_PLUGIN_ROOT=str(env_root / "codex"),
                ),
            ),
            stdout="screenrig\n",
        )
        expect(
            errors,
            "CLAUDE_PLUGIN_ROOT after earlier roots",
            run_launcher(
                env_launcher,
                clean_env(
                    CLAUDE_PLUGIN_ROOT=str(env_root / "claude"),
                    CODEX_PLUGIN_ROOT=str(env_root / "codex"),
                ),
            ),
            stdout="claude\n",
        )
        expect(
            errors,
            "CODEX_PLUGIN_ROOT last",
            run_launcher(env_launcher, clean_env(CODEX_PLUGIN_ROOT=str(env_root / "codex"))),
            stdout="codex\n",
        )

        walked = tmp / "checkout"
        write_stub(walked / "cli" / "dist" / "bin.js", "walk")
        walk_launcher = install_launcher(walked / "deep" / "skills" / "screenrig" / "scripts" / "screenrig")
        expect(
            errors,
            "parent walk finds checkout CLI",
            run_launcher(walk_launcher, clean_env()),
            stdout="walk\n",
        )

        env_beats_walk = tmp / "env-beats-walk"
        write_stub(env_beats_walk / "cli" / "dist" / "bin.js", "walk")
        write_stub(env_beats_walk / "plugin" / "cli" / "dist" / "bin.js", "env")
        env_walk_launcher = install_launcher(
            env_beats_walk / "deep" / "skills" / "screenrig" / "scripts" / "screenrig"
        )
        expect(
            errors,
            "plugin root beats parent walk",
            run_launcher(
                env_walk_launcher,
                clean_env(GROK_PLUGIN_ROOT=str(env_beats_walk / "plugin")),
            ),
            stdout="env\n",
        )

        physical = tmp / "physical"
        write_stub(physical / "cli" / "dist" / "bin.js", "physical")
        install_launcher(physical / "nest" / "skills" / "screenrig" / "scripts" / "screenrig")
        logical_skill = tmp / "logical" / "nest" / "skills" / "screenrig"
        logical_skill.parent.mkdir(parents=True)
        logical_skill.symlink_to(physical / "nest" / "skills" / "screenrig", target_is_directory=True)
        expect(
            errors,
            "physical walk after logical miss",
            run_launcher(logical_skill / "scripts" / "screenrig", clean_env()),
            stdout="physical\n",
        )

        missing = tmp / "missing"
        missing_launcher = install_launcher(missing / "skills" / "screenrig" / "scripts" / "screenrig")
        missing_result = run_launcher(missing_launcher, clean_env())
        if missing_result.returncode != 78:
            errors.append(f"missing CLI: exit {missing_result.returncode}, expected 78")
        if missing_result.stdout:
            errors.append("missing CLI: stdout must stay empty")
        if missing_result.stderr.strip() != MISSING_MESSAGE:
            errors.append(f"missing CLI: unexpected stderr {missing_result.stderr!r}")
        leaked = str(missing)
        if leaked in missing_result.stderr:
            errors.append("missing CLI: stderr leaked a filesystem path")

    if errors:
        print("launcher checks failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("launcher checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
