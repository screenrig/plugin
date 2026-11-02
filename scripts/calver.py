#!/usr/bin/env python3
"""Plugin CalVer: YY.MM.SERIAL (UTC), tagged vYY.MM.N.

CI stamps the bundled CLI with the CalVer tag of the screenrig/cli commit it packs.
"""

from __future__ import annotations

import argparse
import re
import subprocess


RELEASE_TAG = re.compile(r"^v(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$")


def version_from_tag(tag: str) -> str | None:
    if RELEASE_TAG.fullmatch(tag) is None:
        return None
    return tag[1:]


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
    cli_stamp = sub.add_parser("cli-stamp")
    cli_stamp.add_argument("--repository", required=True)
    cli_stamp.add_argument("--commit", required=True)
    args = parser.parse_args()
    version = cli_stamp_for_commit(args.repository, args.commit)
    if version:
        print(version)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
