#!/usr/bin/env python3
"""changelog.html COMMITS 배열에 최신 git 커밋 entry 자동 삽입."""
import subprocess
import sys
import re
from pathlib import Path

REPO_ROOT = Path(subprocess.check_output(
    ["git", "rev-parse", "--show-toplevel"], text=True
).strip())

CHANGELOG = REPO_ROOT / "changelog.html"
if not CHANGELOG.exists():
    sys.exit(0)

def git(*args):
    return subprocess.check_output(["git"] + list(args), text=True).strip()

# 무한루프 방지: "chore: update changelog" 커밋이면 종료
last_msg = git("log", "-1", "--pretty=%s")
if last_msg.startswith("chore: update changelog"):
    sys.exit(0)

# 중복 방지: 이미 해당 hash가 있으면 종료
commit_hash = git("log", "-1", "--pretty=%H")
content = CHANGELOG.read_text(encoding="utf-8")
if commit_hash in content:
    print(f"changelog.html already contains {commit_hash[:7]} — skipping")
    sys.exit(0)

short = git("log", "-1", "--pretty=%h")
author = git("log", "-1", "--pretty=%an")
date = git("log", "-1", "--pretty=format:%ad", "--date=format:%Y-%m-%d %H:%M")
subject = git("log", "-1", "--pretty=%s").replace('"', "'")
body = " ".join(git("log", "-1", "--pretty=%b").splitlines()).replace('"', "'")[:300]
stats_raw = subprocess.check_output(
    ["git", "diff-tree", "--no-commit-id", "-r", "--shortstat", commit_hash],
    text=True
).strip()

# 변경 파일 목록
files_raw = git("diff-tree", "--no-commit-id", "-r", "--name-status", commit_hash)
files_js_parts = []
for line in files_raw.splitlines():
    if "\t" in line:
        status, path = line.split("\t", 1)
        path = path.replace('"', "'")
        files_js_parts.append(f'      {{ s: "{status}", p: "{path}" }}')
files_js = ",\n".join(files_js_parts)

new_entry = f"""  {{
    hash: "{commit_hash}",
    short: "{short}",
    author: "{author}",
    date: "{date}",
    subject: "{subject}",
    body: "{body}",
    stats: "{stats_raw}",
    reasoning: [
      {{
        title: "변경 요약",
        text: "{subject} — 상세 reasoning은 추후 추가 예정."
      }}
    ],
    files: [
{files_js}
    ]
  }},"""

MARKER = "const COMMITS = ["
idx = content.find(MARKER)
if idx == -1:
    print("MARKER not found — skipping", file=sys.stderr)
    sys.exit(0)

insert_pos = idx + len(MARKER) + 1
new_content = content[:insert_pos] + new_entry + "\n" + content[insert_pos:]
CHANGELOG.write_text(new_content, encoding="utf-8")
print(f"✓ changelog.html updated with {short} ({subject[:50]})")
