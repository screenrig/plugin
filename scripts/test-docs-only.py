#!/usr/bin/env python3
"""Verify documentation refresh preserves executable bytes and provenance."""

from __future__ import annotations

import contextlib
import importlib.util
import io
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("build_plugin", ROOT / "scripts/build-plugin.py")
assert spec and spec.loader
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def run(*args: str) -> int:
    with patch.object(sys, "argv", ["build-plugin.py", *args]):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return builder.main()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="screenrig-docs-only-test-") as temporary:
        root = Path(temporary)
        plugins = root / "plugins"
        target = plugins / "screenrig"
        protected = {
            target / "cli/package.json": b'{"version":"26.09.1"}\n',
            target / "cli/dist/bin.js": b'// preserved executable\n',
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
            assert run("--docs-only", "--check") == 1
            assert run("--docs-only") == 0
            assert not stale.exists()
            assert run("--docs-only", "--check") == 0
            for path, content in protected.items():
                assert path.read_bytes() == content, f"changed protected file: {path}"
            assert executable.stat().st_mode & 0o777 == 0o755
            for options in (("--cli-artifact", "unused.tgz"), ("--write-lock",), ("--cli-commit", "a" * 40)):
                assert run("--docs-only", *options) == 2
            (target / "cli/package.json").unlink()
            assert run("--docs-only") == 2
    print("documentation-only generation checks passed")


if __name__ == "__main__":
    main()
