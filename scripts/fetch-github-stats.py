#!/usr/bin/env python3
"""Count public projects and source lines for a GitHub user.

Writes data/github-stats.json. Source lines are counted on each repository's
default branch. Dependencies, builds, lockfiles, and minified files are skipped.
"""

import json
import os
import shutil
import subprocess
import tempfile
import urllib.request
from datetime import datetime, timezone

USER = os.environ.get("GH_USER", "bagariaraj23")
TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(ROOT, "data", "github-stats.json")

SOURCE_EXTENSIONS = {
    ".c", ".cc", ".cpp", ".cs", ".css", ".dart", ".go", ".h", ".hpp",
    ".html", ".java", ".js", ".jsx", ".kt", ".kts", ".php", ".py", ".rb",
    ".rs", ".sass", ".scss", ".sol", ".sql", ".swift", ".ts", ".tsx", ".vue",
}
SKIP_DIRS = {
    ".git", ".next", ".nuxt", ".venv", "build", "coverage", "dist",
    "node_modules", "out", "pods", "target", "vendor", "venv",
}
MAX_FILE_BYTES = 500_000


def api_json(url):
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "portfolio-github-stats",
            **({"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}),
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def list_repos():
    repos = []
    page = 1
    while page <= 10:
        batch = api_json(
            f"https://api.github.com/users/{USER}/repos?per_page=100&type=owner&page={page}"
        )
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return [
        repo for repo in repos
        if not repo.get("fork") and repo.get("size", 0) > 0 and repo["name"] != USER
    ]


def count_lines(root):
    total = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            name for name in dirnames
            if name.lower() not in SKIP_DIRS and not name.startswith(".")
        ]
        for filename in filenames:
            lowered = filename.lower()
            if lowered.endswith((".min.js", ".min.css", ".map", ".lock")):
                continue
            extension = os.path.splitext(filename)[1].lower()
            if extension not in SOURCE_EXTENSIONS:
                continue
            path = os.path.join(dirpath, filename)
            try:
                if os.path.getsize(path) > MAX_FILE_BYTES:
                    continue
                with open(path, "rb") as handle:
                    data = handle.read()
            except OSError:
                continue
            if b"\0" in data:
                continue
            total += data.count(b"\n")
            if data and not data.endswith(b"\n"):
                total += 1
    return total


def main():
    repos = list_repos()
    lines = 0
    counted = 0
    with tempfile.TemporaryDirectory(prefix="github-stats-") as temp:
        for repo in repos:
            dest = os.path.join(temp, repo["name"])
            clone = subprocess.run(
                [
                    "git", "clone", "--depth", "1", "--quiet", "--single-branch",
                    repo["clone_url"], dest,
                ],
                capture_output=True,
                text=True,
                timeout=300,
            )
            if clone.returncode != 0:
                print(f"skip {repo['name']}: clone failed", flush=True)
                continue
            repo_lines = count_lines(dest)
            lines += repo_lines
            counted += 1
            print(f"{repo['name']}: {repo_lines}", flush=True)
            shutil.rmtree(dest, ignore_errors=True)

    payload = {
        "user": USER,
        "projects": counted,
        "lines": lines,
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
    print(json.dumps(payload), flush=True)


if __name__ == "__main__":
    main()
