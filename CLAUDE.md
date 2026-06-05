# NewsAI Frontend — Claude Context

## 프로젝트 개요

AI 뉴스 큐레이터 서비스(NewsAI)의 React 웹 대시보드 파트.
Backend(Spring Boot)와 직접 협업 없음. **API Contract 오너는 Backend.**
openapi.yaml 변경이 필요한 경우 → 코드 수정이 아닌 Backend에 스펙 변경 요청.
파트 간 직접 협업 없음. API Contract 오너는 Backend. openapi.yaml 변경 시 반드시 news-curator-spec 레포에 반영.

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
- API 계약: /specs/api-contract/openapi.yaml ← **읽기 전용, 변경 필요 시 Backend에 요청**
- 화면 설계서: /specs/design/ (Android, React 웹 화면설계서)
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
- JWT 토큰은 localStorage가 아닌 httpOnly 쿠키 또는 메모리 저장 권장
- role: USER / ADMIN에 따라 라우팅 분기 처리
  - ADMIN만 접근 가능한 페이지(W-05~W-07)는 AdminRoute로 별도 보호

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
- 디자인 토큰(색상, 간격, radius)은 tailwind.config.ts에서 관리
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
- 화면 ID(W-01~W-05) 기준으로 컴포넌트 구조 설계할 것
- 테스트 작성 시 /src/__tests__/ 디렉토리 사용

## 화면-API 매핑 요약

| 화면 | API Endpoint | 인증 | 캐시 |
|------|-------------|------|------|
| W-01 메인 대시보드 | GET /api/news?category=&page= | ❌ | staleTime 5분 |
| W-01 개인화 피드 | GET /api/news/feed | ✅ JWT | staleTime 5분 |
| W-01 통계 카드 | GET /api/trends/categories | ❌ | staleTime 5분 |
| W-01 검색 | GET /api/news/search?q= | ❌ | staleTime 없음 |
| W-01 인기 뉴스 | GET /api/news/trending | ❌ | staleTime 5분 |
| W-02 트렌드 분석 | GET /api/trends/keywords | ❌ | staleTime 5분 |
| W-03 편향 분석 | GET /api/news?category=&page= (+ biasScore) | ❌ | staleTime 10분 |
| W-04 기사 상세 | GET /api/news/{id} | ❌ | staleTime 1시간 |
| W-05 관리자 모니터링 | ADMIN 전용 | ✅ JWT | gcTime 없음 |
| 북마크 | GET/POST/DELETE /api/user/bookmarks | ✅ JWT | invalidate 즉시 |
| 관심사 | GET/PUT /api/user/interests | ✅ JWT | invalidate 즉시 |

## 디렉토리 구조

```
src/
├── app/                      ← 라우터 설정 (React Router v6)
├── pages/                    ← 페이지 컴포넌트 (W-01 ~ W-05)
│   ├── Dashboard/            ← W-01 메인 뉴스 대시보드
│   ├── Trends/               ← W-02 트렌드 분석
│   ├── BiasAnalysis/         ← W-03 편향 분석
│   ├── ArticleDetail/        ← W-04 기사 상세
│   └── Admin/                ← W-05~W-07 관리자 (ADMIN only)
├── components/
│   ├── ui/                   ← 공통 UI (Button, Badge, Skeleton 등)
│   ├── layout/               ← Header, Sidebar, Layout
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

specs/                        ← news-curator-spec submodule (수정 금지)
```