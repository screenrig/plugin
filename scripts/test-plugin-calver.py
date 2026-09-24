#!/usr/bin/env python3
"""Deterministic checks for the plugin CalVer distribution stamp.

The released plugin artifact must report one CalVer everywhere it is read:
`marketplace.json`, both plugin manifests, and the bundled CLI `package.json`.
Freshness compares the installed plugin and bundled CLI against that published
CalVer, so a bundled CLI left at `YY.MM.0-dev` would make every release install
look stale forever (F-20260924-07).
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CALVER = ROOT / "scripts" / "calver.py"


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    errors: list[str] = []
    if not CALVER.is_file():
        print("calver.py is missing", file=sys.stderr)
        return 1

    with tempfile.TemporaryDirectory(prefix="screenrig-plugin-calver-") as temporary:
        tmp = Path(temporary)
        plugin_root = tmp / "screenrig"
        marketplace = tmp / "marketplace.json"
        write_json(plugin_root / "cli" / "package.json", {"name": "screenrig", "version": "26.09.0-dev"})
        for platform in ("claude", "codex"):
            write_json(plugin_root / f".{platform}-plugin" / "plugin.json", {"name": "screenrig", "version": "26.09.0-dev"})
        write_json(marketplace, {"name": "screenrig", "plugins": [{"name": "screenrig", "version": "26.09.0-dev"}]})

        result = subprocess.run(
            [
                sys.executable,
                str(CALVER),
                "stamp",
                "--version",
                "26.09.7",
                "--marketplace",
                str(marketplace),
                "--plugin-root",
                str(plugin_root),
            ],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode != 0:
            errors.append(f"stamp exited {result.returncode}: {result.stderr.strip()}")
        else:
            expected = {
                marketplace: "26.09.7",
                plugin_root / "cli" / "package.json": "26.09.7",
                plugin_root / ".claude-plugin" / "plugin.json": "26.09.7",
                plugin_root / ".codex-plugin" / "plugin.json": "26.09.7",
            }
            for path, version in expected.items():
                payload = json.loads(path.read_text(encoding="utf-8"))
                if path.name == "marketplace.json":
                    actual = payload["plugins"][0]["version"]
                else:
                    actual = payload["version"]
                if actual != version:
                    errors.append(f"{path.name}: version {actual!r}, expected {version!r}")

    if errors:
        print("plugin CalVer stamp checks failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1
    print("plugin CalVer stamp checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
