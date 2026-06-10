#!/bin/sh
# changelog.html COMMITS 배열 자동 업데이트 (Python 스크립트 호출)
REPO_ROOT="$(git rev-parse --show-toplevel)"
python3 "$REPO_ROOT/.husky/scripts/update-changelog.py"
