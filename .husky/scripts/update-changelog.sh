#!/bin/sh
# changelog.html COMMITS 배열 자동 업데이트
# post-commit 훅에서 호출됨

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
CHANGELOG="$REPO_ROOT/changelog.html"

[ -f "$CHANGELOG" ] || exit 0

# "chore: update changelog" 커밋이면 무한루프 방지
LAST_MSG="$(git log -1 --pretty=%s)"
case "$LAST_MSG" in
  "chore: update changelog"*) exit 0 ;;
esac

# 이미 changelog.html에 해당 커밋이 있으면 스킵 (중복 방지)
HASH="$(git log -1 --pretty=%H)"
if grep -q "\"$HASH\"" "$CHANGELOG" 2>/dev/null; then
  echo "changelog.html already contains $HASH — skipping"
  exit 0
fi

# 커밋 정보 추출
HASH="$(git log -1 --pretty=%H)"
SHORT="$(git log -1 --pretty=%h)"
AUTHOR="$(git log -1 --pretty=%an)"
DATE="$(git log -1 --pretty=format:'%ad' --date=format:'%Y-%m-%d %H:%M')"
SUBJECT="$(git log -1 --pretty=%s)"
BODY="$(git log -1 --pretty=%b | tr '\n' ' ' | sed "s/[\"]/\\\\'/g")"
STATS="$(git diff-tree --no-commit-id -r --shortstat "$HASH" | tr -d '\n' | sed 's/^ *//')"

# 변경 파일 목록 → JS 배열 생성
FILES_JS=""
while IFS=$'\t' read -r status filepath; do
  FILES_JS="${FILES_JS}      { s: \"${status}\", p: \"${filepath}\" },
"
done < <(git diff-tree --no-commit-id -r --name-status "$HASH")
FILES_JS="${FILES_JS%,
}"  # 마지막 쉼표 제거 (선택적, 파서는 trailing comma 허용)

# 새 COMMIT 엔트리 (reasoning은 placeholder)
NEW_ENTRY="  {
    hash: \"${HASH}\",
    short: \"${SHORT}\",
    author: \"${AUTHOR}\",
    date: \"${DATE}\",
    subject: \"$(echo "$SUBJECT" | sed "s/\"/'/g")\",
    body: \"$(echo "$BODY" | sed 's/"/'"'"'/g')\",
    stats: \"${STATS}\",
    reasoning: [
      {
        title: \"변경 요약\",
        text: \"$(echo "$SUBJECT" | sed 's/"/'"'"'/g') — 상세 reasoning은 추후 추가 예정.\"
      }
    ],
    files: [
${FILES_JS}
    ]
  },"

# COMMITS = [ 바로 뒤에 삽입 (첫 번째 위치 = 최신 커밋)
# macOS sed: -i '' 사용
ESCAPED_ENTRY="$(printf '%s\n' "$NEW_ENTRY" | sed 's/[[\.*^$()+?{|]/\\&/g')"

# Python으로 안전하게 삽입 (sed는 멀티라인 처리 불안정)
python3 - "$CHANGELOG" "$NEW_ENTRY" <<'PYEOF'
import sys

changelog_path = sys.argv[1]
new_entry = sys.argv[2]

with open(changelog_path, 'r', encoding='utf-8') as f:
    content = f.read()

MARKER = 'const COMMITS = ['
idx = content.find(MARKER)
if idx == -1:
    sys.exit(0)

insert_pos = idx + len(MARKER) + 1  # \n 포함
content = content[:insert_pos] + new_entry + '\n' + content[insert_pos:]

with open(changelog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'changelog.html updated with {sys.argv[2][:60]}...')
PYEOF
