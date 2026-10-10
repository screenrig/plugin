#!/usr/bin/env python3
"""Plugin CalVer: YY.MM.SERIAL (UTC), tagged vYY.MM.N.

Marketplaces install git main, so a release commits its version to main and
tags that commit.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path


RELEASE_VERSION = re.compile(r"^(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$")
RELEASE_TAG = re.compile(r"^v(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$")


def is_release_version(value: object) -> bool:
    return isinstance(value, str) and RELEASE_VERSION.fullmatch(value) is not None


def version_from_tag(tag: str) -> str | None:
    if RELEASE_TAG.fullmatch(tag) is None:
        return None
    return tag[1:]


def compare_release(left: str, right: str) -> int:
    a = [int(part) for part in left.split(".")]
    b = [int(part) for part in right.split(".")]
    return (a > b) - (a < b)


def stamp_marketplace(path: Path, version: str) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    plugins = data.get("plugins")
    if not isinstance(plugins, list) or not plugins or not isinstance(plugins[0], dict):
        raise SystemExit(f"{path}: expected one plugin")
    plugins[0]["version"] = version
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def stamp_plugin_root(plugin_root: Path, version: str) -> None:
    manifests = [plugin_root / f".{platform}-plugin" / "plugin.json" for platform in ("claude", "codex")]
    portable = plugin_root / "plugin.json"
    if portable.is_file():
        manifests.append(portable)
    for path in manifests:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise SystemExit(f"{path}: expected a JSON object")
        data["version"] = version
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    # build-plugin.py packs the bundled CLI at the plugin version (16c4eb8), so
    # the tree reports one version everywhere. Keep that true when stamping;
    # otherwise the plugin and its bundled CLI would report different versions.
    package_path = plugin_root / "cli" / "package.json"
    if package_path.is_file():
        package = json.loads(package_path.read_text(encoding="utf-8"))
        if not isinstance(package, dict):
            raise SystemExit(f"{package_path}: expected a JSON object")
        package["version"] = version
        package_path.write_text(json.dumps(package, indent=2) + "\n", encoding="utf-8")


def cli_stamp_for_commit(repository: str, commit: str) -> str | None:
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise SystemExit(f"invalid CLI repository: {repository}")
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise SystemExit(f"invalid CLI commit: {commit}")
    result = subprocess.run(
        ["git", "ls-remote", "--tags", f"https://github.com/{repository}.git"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit("cannot list CLI CalVer tags")
    entries: dict[str, str] = {}
    peeled: dict[str, str] = {}
    for line in result.stdout.splitlines():
        if "\t" not in line:
            continue
        sha, ref = line.split("\t", 1)
        if ref.endswith("^{}"):
            peeled[ref[:-3]] = sha
        else:
            entries[ref] = sha
    versions: list[str] = []
    for ref, sha in entries.items():
        name = ref.removeprefix("refs/tags/")
        version = version_from_tag(name)
        if not version:
            continue
        if peeled.get(ref, sha) == commit:
            versions.append(version)
    if not versions:
        return None
    versions.sort(key=lambda item: [int(part) for part in item.split(".")])
    return versions[-1]


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    from_tag = sub.add_parser("from-tag")
    from_tag.add_argument("tag")

    stamp = sub.add_parser("stamp")
    stamp.add_argument("--version", required=True)
    stamp.add_argument("--marketplace")
    stamp.add_argument("--plugin-root")

    cli_stamp = sub.add_parser("cli-stamp")
    cli_stamp.add_argument("--repository", required=True)
    cli_stamp.add_argument("--commit", required=True)

    args = parser.parse_args()
    if args.command == "from-tag":
        version = version_from_tag(args.tag)
        if not version:
            raise SystemExit(f"release tag must be vYY.MM.N with SERIAL >= 1; received {args.tag}")
        print(version)
        return 0
    if args.command == "stamp":
        if not is_release_version(args.version):
            raise SystemExit(f"refusing to stamp non-release version {args.version}")
        if not args.marketplace and not args.plugin_root:
            raise SystemExit("stamp requires --marketplace and/or --plugin-root")
        if args.marketplace:
            stamp_marketplace(Path(args.marketplace), args.version)
        if args.plugin_root:
            stamp_plugin_root(Path(args.plugin_root), args.version)
        print(f"stamped {args.version}")
        return 0
    if args.command == "cli-stamp":
        version = cli_stamp_for_commit(args.repository, args.commit)
        if version:
            print(version)
        return 0
    raise SystemExit("unknown command")


if __name__ == "__main__":
    raise SystemExit(main())
