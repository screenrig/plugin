#!/usr/bin/env python3
"""Plugin CalVer stamp: YY.MM.SERIAL (UTC), tag vYY.MM.N, untagged YY.MM.0-dev."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


PLACEHOLDER_VERSION = "0.1.2"
RELEASE_VERSION = re.compile(r"^(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$")
DEV_VERSION = re.compile(r"^(\d{2})\.(0[1-9]|1[0-2])\.0-dev$")
RELEASE_TAG = re.compile(r"^v(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$")
BOT_NAME = "github-actions[bot]"
BOT_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com"
TAG_ATTEMPTS = 8
ROOT = Path(__file__).resolve().parent.parent


def is_release_version(value: object) -> bool:
    return isinstance(value, str) and RELEASE_VERSION.fullmatch(value) is not None


def is_dev_version(value: object) -> bool:
    return isinstance(value, str) and DEV_VERSION.fullmatch(value) is not None


def is_product_version(value: object) -> bool:
    return is_release_version(value) or is_dev_version(value)


def is_plugin_version(value: object) -> bool:
    return value == PLACEHOLDER_VERSION or is_product_version(value)


def is_cli_version(value: object) -> bool:
    return value == "0.1.0" or is_product_version(value)


def untagged_dev_version(now: datetime | None = None) -> str:
    stamp = now or datetime.now(timezone.utc)
    return f"{stamp.strftime('%y')}.{stamp.strftime('%m')}.0-dev"


def version_from_tag(tag: str) -> str | None:
    if RELEASE_TAG.fullmatch(tag) is None:
        return None
    return tag[1:]


def compare_release(left: str, right: str) -> int:
    a = [int(part) for part in left.split(".")]
    b = [int(part) for part in right.split(".")]
    return (a > b) - (a < b)


def git(cwd: Path, args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)


def git_config(cwd: Path, key: str) -> str:
    result = git(cwd, ["config", "--get", key])
    return result.stdout.strip() if result.returncode == 0 else ""


def ensure_git_identity(cwd: Path) -> None:
    if git_config(cwd, "user.name") and git_config(cwd, "user.email"):
        return
    if os.environ.get("GITHUB_ACTIONS") == "true":
        git(cwd, ["config", "user.name", BOT_NAME])
        git(cwd, ["config", "user.email", BOT_EMAIL])
        return
    raise SystemExit("git user.name and user.email are required to create an annotated CalVer tag")


def release_tags_at_head(cwd: Path) -> list[str]:
    result = git(cwd, ["tag", "--points-at", "HEAD"])
    if result.returncode != 0:
        return []
    versions = [version_from_tag(line.strip()) for line in result.stdout.splitlines()]
    found = [item for item in versions if item]
    found.sort(key=lambda item: [int(part) for part in item.split(".")])
    return found


def next_release_version(cwd: Path, now: datetime | None = None) -> str:
    stamp = now or datetime.now(timezone.utc)
    prefix = f"v{stamp.strftime('%y')}.{stamp.strftime('%m')}."
    result = git(cwd, ["tag", "--list", f"{prefix}*"])
    serial = 0
    if result.returncode == 0:
        for line in result.stdout.splitlines():
            version = version_from_tag(line.strip())
            if not version:
                continue
            value = int(version.split(".")[2])
            if value > serial:
                serial = value
    return f"{stamp.strftime('%y')}.{stamp.strftime('%m')}.{serial + 1}"


def allocate_tag(cwd: Path, remote: str) -> str:
    for _ in range(TAG_ATTEMPTS):
        fetched = git(cwd, ["fetch", "--tags", "--force", remote])
        if fetched.returncode != 0:
            print("calver: failed to fetch tags; retrying", file=sys.stderr)
        existing = release_tags_at_head(cwd)
        if existing:
            return existing[-1]
        version = next_release_version(cwd)
        tag = f"v{version}"
        ensure_git_identity(cwd)
        git(cwd, ["tag", "-d", tag])
        created = git(cwd, ["tag", "-a", tag, "-m", tag])
        if created.returncode != 0:
            print("calver: failed to create local tag; retrying", file=sys.stderr)
            continue
        pushed = git(cwd, ["push", remote, tag])
        if pushed.returncode == 0:
            return version
        git(cwd, ["tag", "-d", tag])
        print("calver: tag push rejected; retrying", file=sys.stderr)
    raise SystemExit("failed to allocate a CalVer tag for this commit")


def stamp_marketplace(path: Path, version: str) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    plugins = data.get("plugins")
    if not isinstance(plugins, list) or not plugins or not isinstance(plugins[0], dict):
        raise SystemExit(f"{path}: expected one plugin")
    plugins[0]["version"] = version
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def stamp_plugin_root(plugin_root: Path, version: str) -> None:
    for platform in ("claude", "codex"):
        path = plugin_root / f".{platform}-plugin" / "plugin.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise SystemExit(f"{path}: expected a JSON object")
        data["version"] = version
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


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


def load_version(args: argparse.Namespace) -> str:
    env = os.environ.get("SCREENRIG_PLUGIN_VERSION")
    if is_product_version(env):
        return str(env)
    if args.git:
        existing = release_tags_at_head(Path(args.git).resolve())
        if existing:
            return existing[-1]
    return untagged_dev_version()


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    printer = sub.add_parser("print")
    printer.add_argument("--git")

    from_tag = sub.add_parser("from-tag")
    from_tag.add_argument("tag")

    stamp = sub.add_parser("stamp")
    stamp.add_argument("--version", required=True)
    stamp.add_argument("--marketplace")
    stamp.add_argument("--plugin-root")

    tag = sub.add_parser("tag")
    tag.add_argument("--cwd", default=str(ROOT))
    tag.add_argument("--remote", default="origin")

    cli_stamp = sub.add_parser("cli-stamp")
    cli_stamp.add_argument("--repository", required=True)
    cli_stamp.add_argument("--commit", required=True)

    args = parser.parse_args()
    if args.command == "print":
        print(load_version(args))
        return 0
    if args.command == "from-tag":
        version = version_from_tag(args.tag)
        if not version:
            raise SystemExit(f"release tag must be vYY.MM.N with SERIAL >= 1; received {args.tag}")
        print(version)
        return 0
    if args.command == "stamp":
        if not is_product_version(args.version):
            raise SystemExit(f"refusing to stamp non-product version {args.version}")
        if not args.marketplace and not args.plugin_root:
            raise SystemExit("stamp requires --marketplace and/or --plugin-root")
        if args.marketplace:
            stamp_marketplace(Path(args.marketplace), args.version)
        if args.plugin_root:
            stamp_plugin_root(Path(args.plugin_root), args.version)
        print(f"stamped {args.version}")
        return 0
    if args.command == "tag":
        print(allocate_tag(Path(args.cwd).resolve(), args.remote))
        return 0
    if args.command == "cli-stamp":
        version = cli_stamp_for_commit(args.repository, args.commit)
        if version:
            print(version)
        return 0
    raise SystemExit("unknown command")


if __name__ == "__main__":
    raise SystemExit(main())
