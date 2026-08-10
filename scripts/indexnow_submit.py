#!/usr/bin/env python3
"""Submit changed OpenHMI URLs to the IndexNow global endpoint.

No third-party packages are required. The script uses sitemap.xml as the
allowlist of indexable public URLs, so noindex utility pages are not submitted.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

SITE = "https://openhmi.network"
HOST = "openhmi.network"
KEY = "076a019de67eb38a409c5f44faf20761"
KEY_FILE = f"{KEY}.txt"
KEY_LOCATION = f"{SITE}/{KEY_FILE}"
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"


def sitemap_urls() -> list[str]:
    tree = ET.parse(SITEMAP)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for loc in tree.findall(".//sm:loc", ns):
        if loc.text:
            url = loc.text.strip()
            if url.startswith(SITE):
                urls.append(url)
    return urls


def url_to_local_path(url: str) -> str:
    path = urlparse(url).path
    if path in ("", "/"):
        return "index.html"
    return path.lstrip("/")


def changed_files(base: str, head: str) -> set[str]:
    cmd = ["git", "diff", "--name-only", base, head, "--"]
    out = subprocess.check_output(cmd, cwd=ROOT, text=True)
    return {line.strip() for line in out.splitlines() if line.strip()}


def changed_urls(base: str, head: str) -> list[str]:
    urls = sitemap_urls()
    allow = {url_to_local_path(url): url for url in urls}
    changed = changed_files(base, head)
    selected: set[str] = set()

    for path in changed:
        if path in allow:
            selected.add(allow[path])

        # Data-driven pages: registry/resource edits change rendered content.
        if path.startswith("data/registry/"):
            for target in ("contributors.html",):
                if target in allow:
                    selected.add(allow[target])
        if path.startswith("data/resources/") or path.startswith("data/vendors/"):
            for target in ("resources.html",):
                if target in allow:
                    selected.add(allow[target])

    return sorted(selected)


def submit(urls: list[str], dry_run: bool = False) -> int:
    if not urls:
        print("No indexable page changes detected; nothing to submit.")
        return 0

    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    print(json.dumps(payload, indent=2))

    if dry_run:
        print("Dry run only; no request sent.")
        return 0

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.status
            body = response.read().decode("utf-8", "replace")
            print(f"IndexNow response: HTTP {status} {body}".strip())
            return 0 if status in (200, 202) else 1
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        print(f"IndexNow error: HTTP {exc.code} {body}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"IndexNow request failed: {exc}", file=sys.stderr)
        return 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true", help="Submit all URLs in sitemap.xml")
    parser.add_argument("--base", help="Base git revision for changed-page detection")
    parser.add_argument("--head", default="HEAD", help="Head git revision")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.all:
        urls = sitemap_urls()
    elif args.base:
        urls = changed_urls(args.base, args.head)
    else:
        parser.error("use --all or --base <revision>")
        return 2

    return submit(urls, dry_run=args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
