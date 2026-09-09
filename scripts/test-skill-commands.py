#!/usr/bin/env python3
"""Fail closed when skill Commands are missing from the bundled CLI."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "skills" / "screenrig" / "references" / "commands.md"
LAUNCHER = ROOT / "plugins" / "screenrig" / "skills" / "screenrig" / "scripts" / "screenrig"
REQUIRED_COMMANDS = ("media generate", "media download")
COMMAND_LINE = re.compile(r"^([a-z]+(?: [a-z][a-z0-9-]*)*)\b")


def taught_commands(commands_text: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for raw in commands_text.splitlines():
        stripped = raw.strip()
        if not stripped or stripped.startswith("-") or stripped.startswith("(") or stripped.startswith("["):
            continue
        match = COMMAND_LINE.match(stripped)
        if match is None:
            continue
        tokens: list[str] = []
        for part in stripped.split():
            if part.startswith("-") or part.startswith("<") or part.startswith("(") or part.startswith("["):
                break
            if not re.fullmatch(r"[a-z][a-z0-9-]*", part):
                break
            tokens.append(part)
        if not tokens:
            continue
        command = " ".join(tokens[:2] if len(tokens) > 1 else tokens)
        if command not in seen:
            seen.add(command)
            found.append(command)
    return found


def run_launcher(args: list[str]) -> subprocess.CompletedProcess[str]:
    with tempfile.TemporaryDirectory(prefix="screenrig-skill-commands-") as temporary:
        return subprocess.run(
            [str(LAUNCHER), *args],
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


def main() -> int:
    errors: list[str] = []
    if not SKILL.is_file():
        print("skills/screenrig/SKILL.md is missing", file=sys.stderr)
        return 1
    if not LAUNCHER.is_file():
        print("bundled plugin launcher is missing", file=sys.stderr)
        return 1
    skill_text = SKILL.read_text(encoding="utf-8")
    commands_match = re.search(r"## Commands\s+```text\n(.*?)```", skill_text, re.S)
    if commands_match is None:
        errors.append("skills/screenrig/SKILL.md: Commands list missing")
        commands_text = ""
        taught: list[str] = []
    else:
        commands_text = commands_match.group(1)
        taught = taught_commands(commands_text)
    for command in REQUIRED_COMMANDS:
        if command not in commands_text:
            errors.append(f"skills/screenrig/SKILL.md Commands list missing {command}")
        if command not in taught:
            taught.append(command)

    help_result = run_launcher(["--help"])
    usage = f"{help_result.stdout}\n{help_result.stderr}"
    if not usage.strip():
        errors.append("bundled CLI --help produced no usage text")
    for command in taught:
        if command not in usage:
            errors.append(f"bundled CLI usage is missing taught command {command}")

    generate = run_launcher(["--json", "media", "generate"])
    combined = f"{generate.stdout}\n{generate.stderr}"
    if "Unknown media command" in combined:
        errors.append("bundled CLI rejected media generate as Unknown media command")
    else:
        try:
            envelope = json.loads(generate.stdout)
        except json.JSONDecodeError:
            envelope = {}
        error = envelope.get("error") if isinstance(envelope, dict) else None
        code = error.get("code") if isinstance(error, dict) else None
        if code in {None, "unknown_command"}:
            errors.append("bundled media generate must be a real command, not an unknown command")

    if errors:
        print("ScreenRig skill-vs-binary check failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("ScreenRig skill-vs-binary check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
