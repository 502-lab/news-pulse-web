# Newsift Frontend — Claude Context

## 프로젝트 개요

AI 뉴스 큐레이터 서비스(Newsift)의 React 웹 대시보드 파트.
Backend(Spring Boot)와 직접 협업 없음. **API Contract 오너는 Backend.**
openapi.yaml 변경이 필요한 경우 → 코드 수정이 아닌 Backend에 스펙 변경 요청.
openapi.yaml 변경 시 반드시 news-pulse-spec 레포에 반영.

### Backend 핵심 기능 (참고용)
- 뉴스 수집 스케줄러 (NewsAPI 연동, 30분 주기)
- Gemini API를 활용한 기사 AI 요약 처리
- 사용자 관심사 기반 개인화 필터링
- 트렌드 키워드 집계 API 제공

## 기술 스택

- Framework: Vite + React 18
- Language: TypeScript
- 상태관리: TanStack Query v5 (서버 상태) + Zustand (클라이언트 상태)
- 스타일: Tailwind CSS
- 차트: Recharts
- HTTP 클라이언트: Axios
- 라우터: React Router v6
- API 타입: /generated/api-types.ts (openapi 자동생성, 직접 수정 금지)
- 패키지 매니저: pnpm

## 참조 문서 (구현 전 반드시 확인)

- 기능 스펙: /specs/features/
- API 계약: /spec/api-contract/openapi.yaml ← **읽기 전용, 변경 필요 시 Backend에 요청**
- 디자인 소스(SSOT): `~/Downloads/Newsift_screens/` — 자세한 프로토콜은 [섹션 A] 참조
- 아키텍처 결정: /specs/adr/

## 브랜치 전략

- prd: 최종 배포 (직접 커밋 금지)
- dev: 개발 통합 (직접 커밋 금지)
- feat/xxx: 기능 개발 → dev로 PR
- hotfix/xxx: 긴급 수정 → prd로 PR 후 dev 역머지
- refactor/xxx: 리팩토링 → dev로 PR

## 환경변수

- 로컬: .env.local (gitignore, .env.example 참고)
- dev 서버: 서버에 .env.dev 직접 배치
- prd 서버: 서버에 .env.prd 직접 배치
- 하드코딩 금지, 반드시 VITE_ 접두사 환경변수 사용

```.env.example
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 코딩 규칙

### 컴포넌트

- 컴포넌트 생성 시 로딩(스켈레톤) / 에러 / 빈 상태(Empty State) 항상 함께 처리
- 스켈레톤 UI는 shimmer 애니메이션 적용 (좌→우 빛 효과)
- aria 속성 누락 금지
- 100줄 초과 시 컴포넌트 분리 검토

### 인증 / 라우팅

- 인증이 필요한 페이지는 ProtectedRoute로 감쌀 것
- **토큰 저장**: JWT는 Backend가 응답 body로 내려준다(httpOnly 쿠키 미사용).
  accessToken은 **메모리**, refreshToken은 **localStorage**에 저장하고, 앱 부팅 시
  refreshToken으로 silent refresh 해 세션을 복원한다. rotation 방식이라 갱신 시마다
  새 refreshToken으로 교체 저장한다. (XSS 대비 CSP·입력 새니타이즈 필수, BFF/쿠키
  전환은 추후 과제 — 상세는 004 §3)
- role: USER / ADMIN에 따라 라우팅 분기 처리
  - ADMIN만 접근 가능한 페이지는 AdminRoute로 별도 보호
  - USER / ADMIN은 레이아웃 셸 자체가 다름 (A-3 참조)
  - 접근 게이트 우선순위(재동의 > 이메일인증 > 온보딩 > 역할별 홈)는 004 spec을 따른다

### API

- API 타입은 /generated/api-types.ts에서만 import
- API URL 하드코딩 금지, VITE_API_URL 환경변수 사용
- API 호출은 /src/lib/api/ 디렉토리에서만 작성
- 서버 상태는 TanStack Query로 관리, staleTime / gcTime 명시
- Mutation 후 관련 쿼리 invalidate 필수
- /generated/api-types.ts와 실제 API 응답이 다를 경우
  → 코드 수정 금지, Backend에 openapi.yaml 수정 요청

### 스타일

- Tailwind CSS only, 인라인 style 금지
- 디자인 토큰(색상, 간격, radius)은 tailwind.config.ts에서 관리 — 실측값은 A-2 참조
- 다크/라이트 모드 대응 필수 (Tailwind dark: 클래스 사용)
- 반응형 브레이크포인트: mobile(<768px) / tablet(768~1279px) / desktop(≥1280px)

### 차트 (Recharts)

- 트렌드 페이지: LineChart (시간대별 기사 수), BarChart (카테고리별)
- 편향 분석 페이지: 커스텀 수평 BarChart (언론사별 편향 점수)
- 워드클라우드: 별도 라이브러리 또는 커스텀 SVG 구현

### 기타

- 스펙에 없는 기능 임의 추가 금지
- any 타입 사용 금지
- console.log 커밋 금지
- 카테고리 뱃지 색상은 constants/category.ts에서 중앙 관리

## AI 지침

- git commit 전 반드시 사용자에게 커밋 여부를 확인할 것 (명시적으로 요청한 경우 제외)
- 구현 전 /specs/features/ 해당 스펙 파일 먼저 확인할 것
- API 호출 코드 작성 전 openapi.yaml 확인할 것
- /generated/api-types.ts와 실제 API 응답이 다를 경우
  → 코드가 아닌 스펙 수정이 필요하다고 알려줄 것 (Backend에 요청)
- 화면 ID(W08~WA04) 기준으로 컴포넌트 구조 설계할 것 — A-4 매핑 참조
- 테스트 작성 시 /src/__tests__/ 디렉토리 사용
- 백엔드 블로커 발생 시 조용히 건너뛰지 말고 B-3 절차에 따라 GitHub 이슈 등록

## 디렉토리 구조

```
src/
├── app/                      ← 라우터 설정 (React Router v6)
├── pages/                    ← 페이지 컴포넌트 (화면 ID별)
│   ├── auth/                 ← W08~W10 로그인·회원가입·비밀번호 찾기
│   ├── onboarding/           ← W12 온보딩
│   ├── user/                 ← WU01~WU06 일반 사용자 화면
│   └── admin/                ← WA01~WA04 관리자 전용
├── components/
│   ├── ui/                   ← 공통 UI (Button, Badge, Skeleton 등)
│   ├── layout/               ← 레이아웃 셸
│   │   ├── AuthShell.tsx         ← auth·온보딩·약관·오류
│   │   ├── UserGnbLayout.tsx     ← USER 전 화면 (상단 GNB)
│   │   └── AdminSidebarLayout.tsx ← ADMIN 전 화면 (좌측 사이드바)
│   └── features/             ← 기능별 컴포넌트
│       ├── news/             ← NewsCard, NewsFeed, CategoryTabs
│       ├── trends/           ← TrendList, LineChart, WordCloud
│       ├── bias/             ← BiasBar, MediaBiasChart, BiasTable
│       └── auth/             ← LoginForm, ProtectedRoute, AdminRoute
├── hooks/                    ← 커스텀 훅
│   ├── useNews.ts
│   ├── useTrends.ts
│   ├── useBookmark.ts
│   └── useAuth.ts
├── stores/                   ← Zustand 스토어
│   ├── authStore.ts          ← 인증 상태 (user, token, role)
│   └── uiStore.ts            ← 다크모드, 사이드바 상태
├── lib/
│   └── api/                  ← API 클라이언트
│       ├── client.ts         ← Axios 인스턴스 (interceptor 포함)
│       ├── news.ts
│       ├── trends.ts
│       ├── bookmarks.ts
│       └── auth.ts
├── constants/
│   └── category.ts           ← 카테고리 색상, 레이블 상수
└── __tests__/                ← 테스트

generated/
└── api-types.ts              ← openapi 자동생성 (수정 금지)

spec/                         ← news-pulse-spec submodule (수정 금지)
└── api-contract/openapi.yaml

specs/                        ← 로컬 feature spec (001~019)
```

---

## 섹션 A — 디자인 소스 & 화면 구현 프로토콜

### A-1. 디자인 단일 소스(SSOT)

화면 디자인의 단일 소스는 로컬 **다운로드 폴더의 `Newsift_screens/`** 다.
`DESIGN_DIR = ~/Downloads/Newsift_screens/` (macOS)

화면 spec(005~)을 구현하기 전, **반드시 아래 순서로 읽는다.** 토큰·컴포넌트를 추측으로 재정의하지 말 것.

1. `$DESIGN_DIR/README.md` — 디자인 시스템 개요 + 화면 인덱스
2. 공유 파일 1회 통독 — `$DESIGN_DIR/ui.jsx`(공통 컴포넌트), `charts.jsx`(차트), `data.jsx`(목업 데이터)
3. 대상 화면의 `$DESIGN_DIR/*.html` + README가 가리키는 `*.jsx` 소스
4. 아래 A-2 토큰과 A-3 레이아웃 셸을 준수해 구현

> ⚠️ 다운로드 폴더는 머신·사용자에 종속적이라 다른 PC나 CI에서는 경로가 안 맞는다. 협업·자동화로 확장되면 `docs/design/`로 repo에 커밋하는 걸 권장.

### A-2. 디자인 토큰 (HTML `tailwind.config` 실측값 — 변경 금지)

```
colors:
  brand   #6366F1   (50 #EEF0FF · 100 #E0E2FF · 600 #5457E5 · 700 #4548C9)
  cyan    #06B6D4
  ink     #0F172A   (700 #334155 · 500 #64748B · 400 #94A3B8 · 300 #CBD5E1 · 200 #E2E8F0 · 100 #F1F5F9)
  navy    #0F172A   (800 #1E293B · 700 #334155 · 600 #475569)   ← 다크 표면(admin 사이드바 등)
  canvas  #F8FAFC                                               ← 앱 배경
  ok #10B981 · warn #F59E0B · danger #EF4444

borderRadius:  card 8px · btn 6px · input 4px
boxShadow:
  card       0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)
  cardhover  0 2px 4px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.08)
  pop        0 8px 28px rgba(15,23,42,.16)

font:  Pretendard(한글·본문) + Inter(라틴·숫자) · 숫자는 tabular-nums
```

### A-3. 레이아웃 셸 (004에서 정의, 화면은 본문만 채움)

| 셸 | 적용 | 형태 |
|---|---|---|
| `AuthShell` | auth·온보딩·약관·오류 | 중앙 카드(max 380~400px) + 브랜드마크 |
| `UserGnbLayout` | USER 전 화면 | 상단 GNB 5탭 + 검색(MVP 숨김) + 프로필 메뉴 · `canvas` 배경 |
| `AdminSidebarLayout` | ADMIN 전 화면 | 좌측 `navy` 사이드바 240px + 본문 |

### A-4. spec → 화면 파일 매핑

| spec | 파일 | jsx 소스 |
|---|---|---|
| 005 auth | auth-01-login-W08 / auth-02-signup-W09 / auth-03-findpw-W10 | screens3.jsx (Login/Signup/FindPassword/Legal/Error) |
| 006 온보딩 | auth-04-onboarding-W12 | screens4.jsx |
| 007 뉴스 홈 | user-01-home-WU01 | screen-newshome.jsx |
| 008 기사 상세 | user-06-article-W04 | screens2.jsx (ArticleScreen) |
| 009 트렌드 | user-02-trends-W02 | screens1.jsx (TrendsScreen) |
| 010 편향 분석 | user-03-bias-W03 | screens1.jsx (BiasScreen) |
| 011 내 인사이트 | user-04-insight-WU05 | screen-insight.jsx |
| 012 주간 브리핑 | user-05-weekly-WU06 | screen-weekly.jsx |
| 013 기사 비교 | user-07-compare-WU02 | screen-compare.jsx |
| 014 운영 대시보드 | admin-01-ops-WA01 | screen-ops.jsx |
| 015 수집 관리 | admin-02-ingestion-WA02 | screen-ingestion.jsx |
| 016 콘텐츠 분석 | admin-03-content-WA05 | screen-content.jsx |
| 017 사용자 관리 | admin-04-users-W07 | screens2.jsx (UsersScreen) |
| 018 공지/알림 | admin-05-notice-WA04 | screen-notice.jsx |

### A-5. 프로토타입 취급 주의

`Newsift_screens`는 React+Babel(in-browser) + Tailwind CDN + 목업 데이터로 만든 **디자인 참조용 프로토타입**이다. 코드를 그대로 복사하지 말고 **디자인 의도(레이아웃·토큰·컴포넌트 구성)만 추출**해 프로덕션 스택(실제 빌드·실 API)으로 재구현한다. 데이터는 전부 `data.jsx` 목업이므로 실제 API 계약으로 대체한다.

---

## 섹션 B — 백엔드 블로커 GitHub 이슈 규칙

### B-1. 원칙

작업 중 **백엔드에 의존하는데 막히는 것**을 만나면, 조용히 건너뛰거나 영구 stub으로 묻지 않는다. **반드시 GitHub 이슈로 남긴다.** stub/목업으로 화면 진행은 하되, 그 stub에는 이슈 번호를 단 TODO를 남긴다.

### B-2. 트리거 (아래 중 하나라도)

- spec/태스크가 요구하는 백엔드 엔드포인트가 **없거나 404**
- 백엔드 응답이 문서화된 **계약과 불일치**
- 작업 중 발견된, 현재 spec 범위 밖이며 **백엔드/타 팀에 속하는** 일감
- 프론트에서 해소 불가한 블로킹 TODO

### B-3. 절차

```bash
# 0) 설정 — 이슈 성격에 따라 repo 분리
BACKEND_REPO="502-lab/news-pulse-back"   # 구현·동작·미구현 이슈
SPEC_REPO="502-lab/news-pulse-spec"      # 계약(openapi)·스키마 불일치 이슈
# 규칙: 계약/스키마 문제 → $SPEC_REPO,  미구현·버그·동작 문제 → $BACKEND_REPO
# (owner가 다르면 수정)

# 1) 중복 확인 — 같은 키워드 열린 이슈 있으면 새로 만들지 말고 코멘트
gh issue list --repo "$BACKEND_REPO" --state open --search "<핵심 키워드>"

# 2) 없으면 생성 (계약 이슈면 --repo "$SPEC_REPO")
gh issue create --repo "$BACKEND_REPO" \
  --title "[FE-blocked][<spec-id>] <한 줄 요약>" \
  --label "backend,blocked,api-missing" \
  --body "$(cat <<'EOF'
## 발견 위치
- spec / 화면: <예: 013 기사 비교 / user-07-compare>
- 관련 파일·태스크: <경로>

## 기대 동작 (필요한 계약)
- 엔드포인트 / 메서드 / 요청·응답 형태:

## 현재 상태
- <404 / 미구현 / 계약 불일치 등>

## 프론트 임시 처리
- <목업·stub 여부, 영향 범위>

## 제안
- <제안 엔드포인트·스키마 등>
EOF
)"
```

생성 후:
- 코드에 `// TODO(#<이슈번호>): <내용>` 를 남겨 이슈와 연결한다.
- 해당 spec의 진행 메모/PR 설명에 블로커와 이슈 링크를 적는다.

### B-4. 지금 바로 등록할 시드 이슈 (이미 파악된 백엔드 공백)

| 제목 | repo | 라벨 | 비고 |
|---|---|---|---|
| `[FE-blocked] 검색 API 부재` | back | backend, api-missing | GNB 검색·`/search` 동작 불가 (현재 박스 숨김) |
| `[FE-blocked] 북마크 영속 API 부재` | back | backend, api-missing | 현재 클라이언트 전용 토글만 가능 |
| `[FE-blocked][013] 기사 비교 API 미구현` | back | backend, api-missing | compare 화면 목업으로만 진행 |
| `[FE-blocked] 계정 탈퇴 API 미구현` | back | backend, api-missing | 설정 화면의 탈퇴 동선 보류 |
| `[FE-decision] 기사 상세 public 접근 정책` | back | backend, decision | `/api/v1/articles/**` permitAll 여부 — 프론트 방향 확정 후 |

> 이 5건은 spec 진행과 무관하게 먼저 등록해두면 추후 재발견 비용이 사라진다.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current active
plan under `specs/<active-feature>/plan.md`.
(이 블록은 `/plan` 실행 시 현재 피처 경로로 자동 갱신됨 — 폐기된 003은 더 이상 참조하지 않음)
<!-- SPECKIT END -->
