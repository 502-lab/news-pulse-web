# Tasks: 003 메인 대시보드 (W-01)

**Input**: `specs/003-main-dashboard/`  
**Branch**: `003-main-dashboard`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[US1]**: 통계 현황 한눈에 파악 (StatCard 4종)
- **[US2]**: 카테고리별 뉴스 분포 확인 (BarChart)
- **[US3]**: 최신 뉴스 목록 탐색 (NewsFeed)

---

## Phase 1: Setup (공유 인프라)

**Purpose**: 패키지 설치, Icon 아이콘 추가, 공통 유틸리티 생성

- [X] 003-01-1 `pnpm add clsx recharts date-fns` 실행 후 package.json 확인
- [X] 003-01-2 `src/components/ui/Icon.tsx` 수정 — Newspaper, Tag, ArrowUpRight, ArrowDownRight, Minus import 추가 + LUCIDE_MAP 등록
- [X] 003-01-3 [P] `src/components/common/ErrorBoundary.tsx` 신규 생성 — React 19 class component 직접 구현 (react-error-boundary 라이브러리 사용 금지), Props: `{ children: ReactNode; fallback?: ReactNode }`, State: `{ hasError: boolean }`
- [X] 003-01-4 [P] `src/constants/category.ts` 신규 생성 — `CategoryMeta { label, className, chartColor }` 인터페이스 + 6개 카테고리 `CATEGORY_MAP` + `getCategoryMeta(category)` 헬퍼 함수 (chartColor는 Recharts Bar fill용 hex 값: politics=#ef4444, economy=#3b82f6, society=#eab308, technology=#a855f7, culture=#22c55e, sports=#f97316, default=#6b7280)
- [X] 003-01-5 `src/index.css` 수정 — shimmer keyframe 추가: `@keyframes shimmer { 100% { transform: translateX(100%); } }` + `@theme` 또는 CSS 레이어에 `--animate-shimmer: shimmer 1.5s infinite;` 등록 (기존 @theme 블록 내부에 추가)

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음. `pnpm dev` 구동 확인. `<Icon name="Newspaper" />` 렌더 에러 없음.

---

## Phase 2: Foundational (모든 User Story 블로킹 전제조건)

**Purpose**: 타입 정의 + mock 데이터 — 모든 훅/컴포넌트가 의존

**⚠️ CRITICAL**: 이 Phase 완료 전 User Story 작업 시작 불가

- [X] 003-02-1 `src/types/dashboard.ts` 신규 생성 — `DashboardStat`, `CategoryData`, `NewsItem`, `UseQueryResult<T>` 인터페이스 export (any 타입 금지, TODO 주석 포함: "실제 API 연동 시 /generated/api-types.ts로 교체")
- [X] 003-03-1 `src/mocks/dashboard.mock.ts` 신규 생성 — `delay()` 함수 (`import.meta.env.VITE_MOCK_DELAY === 'true'`일 때만 500ms 적용, 아니면 즉시 resolve), `fetchDashboardStats()` (DashboardStat 4개), `fetchCategoryChart()` (CategoryData 6개), `fetchNewsFeed()` (NewsItem 10개, thumbnailUrl null은 3번째마다 null 설정)

**Checkpoint**: 두 파일 모두 `tsc --noEmit` 에러 없음. mock 함수 직접 import 후 타입 추론 확인.

---

## Phase 3: User Story 1 — StatCard 4종 (Priority: P1) 🎯 MVP

**Goal**: 오늘의 뉴스 수 / 분석된 기사 수 / 평균 편향 점수 / 모니터링 키워드 수 StatCard 4개 렌더

**Independent Test**: `/` 접근 후 4개 카드 텍스트 + delta 색상 확인

### US1 구현

- [X] 003-04-1 [US1] `src/hooks/useDashboardStats.ts` 신규 생성 — `useState<DashboardStat[] | null>(null)` + `useCallback` + `useEffect`로 `fetchDashboardStats()` 호출, 반환: `UseQueryResult<DashboardStat[]>` (isLoading 초기값 true)
- [X] 003-07-1 [P] [US1] `src/components/features/dashboard/StatCardSkeleton.tsx` 신규 생성 — shimmer 카드 1개 (`animate-[shimmer_1.5s_infinite]` 또는 `[animation:var(--animate-shimmer)]` 클래스 사용, `relative overflow-hidden bg-white/5 rounded-xl p-5 h-[120px]`에 `before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:[animation:shimmer_1.5s_infinite]`)
- [X] 003-07-2 [US1] `src/components/features/dashboard/StatCard.tsx` 신규 생성 — props: `{ stat: DashboardStat }`, `<article aria-label={stat.label}>` 래퍼, Icon(stat.icon, size=20), h3 제목, 수치(text-3xl font-bold), delta 색상 clsx 3분기(`delta > 0 → text-green-500`, `delta < 0 → text-red-500`, `delta === 0 → text-gray-400`), delta 아이콘(`delta > 0 → ArrowUpRight`, `delta < 0 → ArrowDownRight`, `delta === 0 → Minus`), deltaPercent 표시

**Checkpoint**: `DashboardPage` 임시 수정 없이 `StatCard` 단독 렌더 테스트 가능. tsc 에러 없음.

---

## Phase 4: User Story 2 — 카테고리 바차트 (Priority: P2)

**Goal**: 정치/경제/사회/기술/문화/스포츠 6개 카테고리 오늘 뉴스 수 BarChart 시각화

**Independent Test**: BarChart SVG 렌더 + 6개 카테고리 레이블 확인

### US2 구현

- [X] 003-05-1 [US2] `src/hooks/useCategoryChart.ts` 신규 생성 — `fetchCategoryChart()` 호출, 반환: `UseQueryResult<CategoryData[]>` (003-04-1과 동일 패턴)
- [X] 003-08-1 [P] [US2] `src/components/features/dashboard/CategoryChartSkeleton.tsx` 신규 생성 — shimmer 박스 (`h-[240px] rounded-xl bg-white/5 relative overflow-hidden` + shimmer before 클래스)
- [X] 003-08-2 [US2] `src/components/features/dashboard/CategoryChart.tsx` 신규 생성 — props: `{ data: CategoryData[]; isError: boolean; refetch: () => void }`, Recharts `<ResponsiveContainer width="100%" height={240}>` + `<BarChart>` + `<XAxis dataKey="category" tickFormatter={(v) => getCategoryMeta(v).label} />` + `<YAxis />` + `<Tooltip formatter={(v, name) => [v, getCategoryMeta(String(name)).label]} />` + `<Bar dataKey="count">` 내부에 `{data.map((entry, i) => <Cell key={i} fill={getCategoryMeta(entry.category).chartColor} />)}`, 에러 상태: isError → "데이터를 불러올 수 없습니다." + `<button onClick={refetch}>재시도</button>` (`aria-label="카테고리 데이터 재시도"`), 빈 상태: `data.every(d => d.count === 0)` → "아직 집계된 데이터가 없습니다.", `<section aria-label="카테고리별 뉴스 분포">`으로 감싸기

**Checkpoint**: Recharts BarChart 렌더 에러 없음. 6개 카테고리 X축 한글 레이블 표시 확인.

---

## Phase 5: User Story 3 — 뉴스 피드 (Priority: P3)

**Goal**: 최신 뉴스 10개 카드 목록, 클릭 시 /articles/:id 이동

**Independent Test**: 뉴스 카드 10개 렌더 + 클릭 URL 변경 확인

### US3 구현

- [X] 003-06-1 [US3] `src/hooks/useNewsFeed.ts` 신규 생성 — `fetchNewsFeed()` 호출, 반환: `UseQueryResult<NewsItem[]>` (003-04-1과 동일 패턴)
- [X] 003-09-1 [P] [US3] `src/components/features/dashboard/NewsFeedSkeleton.tsx` 신규 생성 — shimmer 카드 10개 (`Array.from({ length: 10 }).map((_, i) => <li key={i}>...</li>)`), 각 shimmer 카드: `flex gap-4 p-4` + 썸네일 영역(`w-40 h-[90px] rounded-lg bg-white/10 shimmer`) + 텍스트 줄 3개(`h-4 rounded bg-white/10 shimmer`)
- [X] 003-09-2 [P] [US3] `src/components/features/dashboard/NewsCard.tsx` 신규 생성 — props: `{ item: NewsItem }`, `<article>` 래퍼, **`<div onClick>` 금지** → `<a href={/articles/${item.id}}>` 또는 react-router-dom `<Link to={/articles/${item.id}}>` 내부에 컨텐츠 배치, `useState<boolean>(false)` imgError, `showFallback = !item.thumbnailUrl || imgError`, 썸네일: showFallback이면 `<div aria-hidden="true" className="w-40 h-[90px] bg-white/10 ..."><Icon name="Newspaper" /></div>`, 아니면 `<img src={item.thumbnailUrl!} alt={item.title} loading="lazy" onError={() => setImgError(true)} />`, 카테고리 배지: `getCategoryMeta(item.category).className`, 발행 시간: `formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: ko })` (date-fns/locale/ko import), 키보드 접근 보장 (Link 컴포넌트는 기본적으로 Tab 접근 가능)
- [X] 003-10-1 [US3] `src/components/features/dashboard/NewsFeed.tsx` 신규 생성 — props: `{ items: NewsItem[]; isLoading: boolean; isError: boolean; refetch: () => void }`, isLoading → `<NewsFeedSkeleton />`, isError → "뉴스를 불러올 수 없습니다." + `<button onClick={refetch} aria-label="뉴스 다시 불러오기">재시도</button>`, items.length === 0 → `<div role="status">표시할 뉴스가 없습니다. <Icon name="inbox" /></div>`, items > 0 → `<ul aria-label="뉴스 목록">{items.map(item => <li key={item.id}><NewsCard item={item} /></li>)}</ul>`

**Checkpoint**: NewsFeed 단독 렌더 확인. Link 클릭 시 URL 변경 확인. 썸네일 null 케이스 fallback 확인.

---

## Phase 6: Integration + Polish

**Purpose**: DashboardPage 조합, router lazy 교체, mock 딜레이 환경변수화 완료 확인

- [X] 003-11-1 `src/components/features/dashboard/index.ts` 신규 생성 — barrel export: StatCard, StatCardSkeleton, CategoryChart, CategoryChartSkeleton, NewsCard, NewsFeed, NewsFeedSkeleton 7개 export (default export를 named export로)
- [X] 003-12-1 `src/pages/DashboardPage.tsx` 기존 placeholder 교체 — `useDashboardStats`, `useCategoryChart`, `useNewsFeed` import, `{ StatCard, StatCardSkeleton, CategoryChart, CategoryChartSkeleton, NewsFeed }` import from `@/components/features/dashboard`, `ErrorBoundary` import from `@/components/common/ErrorBoundary`, 3개 `<section>` 각각 `ErrorBoundary`로 감싸기 (`aria-label`: "통계 현황" / "카테고리별 뉴스 분포" / "최신 뉴스"), StatCard 그리드: `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4`, isError 인라인 처리 (ErrorBoundary fallback은 예상치 못한 throw용)
- [X] 003-13-1 `src/layouts/AppShell.tsx` 수정 — `import { Suspense } from 'react'`와 `import FullPageSpinner from '@/components/common/FullPageSpinner'` 추가, `<main>` 내부를 `<Suspense fallback={<FullPageSpinner />}>...</Suspense>`로 감싸기
- [X] 003-13-2 `src/router.tsx` 수정 — `import DashboardPage from '@/pages/DashboardPage'` 제거, `import { lazy } from 'react'` 추가, `const DashboardPage = lazy(() => import('@/pages/DashboardPage'))` 추가 (다른 페이지는 이후 스프린트에서 lazy 전환)

**Checkpoint**: `pnpm tsc --noEmit` 전체 에러 없음. `/` 접근 → FullPageSpinner 잠깐 표시 후 DashboardPage 3섹션 렌더 확인.

---

## Phase 7: Verification

**Purpose**: 자동 검증 스크립트로 S-01~S-07 모두 PASS 확인

- [X] 003-14-1 `pnpm tsc --noEmit` 실행 — 에러 0개 확인 (에러 있으면 수정 후 진행)
- [X] 003-14-2 `scripts/verify-003.mjs` 신규 생성 — puppeteer-core + 시스템 Chrome(`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`), S-01~S-07 시나리오 검증 (verify-002.mjs 패턴 동일), S-06(에러)/S-07(빈 상태)는 `src/mocks/dashboard.mock.ts` 임시 수정 + 2800ms sleep + `page.goto()` + try/finally 원복, puppeteer `role` 기반 쿼리로 접근성 확인 (예: `page.getByRole('article')`, `page.getByRole('button', { name: '재시도' })`), 출력 형식: `S-01 · 설명  ✅ PASS / ❌ FAIL`
- [X] 003-14-3 `node scripts/verify-003.mjs` 실행 — 7/7 PASS 확인

**검증 시나리오 매핑**:

| ID | 검증 내용 | 확인 방법 |
|----|----------|----------|
| S-01 | StatCard 4종 텍스트 ("오늘의 뉴스 수" 등) | `page.$eval` 텍스트 포함 확인 |
| S-02 | delta 색상 클래스 (green/red/gray) | `classList.contains('text-green-500')` 등 |
| S-03 | Recharts BarChart 렌더 | `.recharts-wrapper` SVG 존재 |
| S-04 | 뉴스 카드 article 10개 | `page.$$('article')` count === 10 |
| S-05 | 첫 번째 뉴스 클릭 → `/articles/` URL | `page.url()` startsWith `/articles/` |
| S-06 | 바차트 에러 → "데이터를 불러올 수 없습니다." + 재시도 버튼 | mock 수정, 텍스트 + role=button 확인 |
| S-07 | 뉴스 피드 빈 상태 → "표시할 뉴스가 없습니다." | mock 수정, 텍스트 + role=status 확인 |

---

## Complexity Tracking

| 태스크 | 위반 가능 원칙 | 복잡도 사유 | 해결 방안 |
|--------|--------------|------------|----------|
| 003-01-5 | — | Tailwind v4 shimmer keyframe 추가 위치 — config.ts 없을 수 있음 | `src/index.css` `@keyframes` 블록 직접 추가 |
| 003-03-1 | II. API Contract | mock 구조가 실제 API와 다를 수 있음 | TODO 주석 + `UseQueryResult<T>` 타입 경계 명확화 |
| 003-07-2 | IV. Type Safety | delta 0 케이스 별도 분기 누락 시 Minus 아이콘 미표시 | clsx 3분기 명시 (`> 0`, `< 0`, `=== 0`) |
| 003-08-2 | V. Accessibility | Recharts 기본 차트 aria 지원 미흡 | `<BarChart aria-label>` + `<section aria-label>` 명시 |
| 003-09-2 | V. Accessibility | `<div onClick>` 패턴 금지 | `<Link to=...>` 내부 컨텐츠 배치, Tab 접근 보장 |
| 003-09-2 | V. Accessibility | thumbnailUrl null 케이스 alt="" 필수 | `showFallback` 분기 — fallback div는 `aria-hidden="true"` |
| 003-12-1 | III. Complete State | ErrorBoundary 적용 범위 결정 | 섹션별 독립 감싸기 (3개 section 각각) |
| 003-13-1 | — | Suspense 위치 결정 | AppShell `<main>` 내부 — Sidebar 즉시 렌더 보장 |
| 003-14-2 | — | S-06/S-07 mock 파일 수정 패턴 (HMR 대기) | try/finally 원복 필수, 2800ms sleep |

---

## Dependencies & Execution Order

### Phase 의존성

```
Phase 1 (Setup)
  └── Phase 2 (Foundational)   ← 블로킹
        ├── Phase 3 (US1 StatCard)     [P 가능]
        ├── Phase 4 (US2 BarChart)     [P 가능]
        └── Phase 5 (US3 NewsFeed)     [P 가능]
              └── Phase 6 (Integration)
                    └── Phase 7 (Verification)
```

### User Story 내 의존성

**US1**: `003-04-1` → `003-07-2` (003-07-1은 병렬)

**US2**: `003-05-1` → `003-08-2` (003-08-1은 병렬)

**US3**: `003-06-1` → `003-09-2` / `003-09-1` (병렬) → `003-10-1`

**Integration**: `003-11-1` → `003-12-1` → `003-13-1` → `003-13-2`

---

## Parallel Opportunities

Phase 2 완료 후 동시 시작 가능:

```
# 3개 User Story 병렬 시작 가능
Task: 003-04-1 useDashboardStats.ts
Task: 003-05-1 useCategoryChart.ts
Task: 003-06-1 useNewsFeed.ts

# 각 US 내 skeleton 병렬 생성
Task: 003-07-1 StatCardSkeleton.tsx
Task: 003-08-1 CategoryChartSkeleton.tsx
Task: 003-09-1 NewsFeedSkeleton.tsx
```

---

## Implementation Strategy

### MVP (User Story 1만)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 StatCard만 구현
4. 003-11-1 barrel, 003-12-1 DashboardPage (StatCard 섹션만), 003-13-1/2 lazy
5. S-01, S-02만 verify

### Full Delivery (권장)

1. Phase 1 → Phase 2 순서대로
2. Phase 3 + Phase 4 + Phase 5 병렬
3. Phase 6 → Phase 7 순서대로

---

## Notes

- `003-09-2 NewsCard`: `<div onClick>` 패턴 절대 금지 — CI에서 접근성 lint로 감지될 수 있음
- `003-14-2 verify-003.mjs`: puppeteer `getByRole`은 puppeteer-core 25.x 지원 확인 필요 (없으면 `$$eval` + aria-label로 대체)
- Phase 7 완료 후 mock delay: `.env.local`에 `VITE_MOCK_DELAY=true` 설정 시 500ms 딜레이 활성화
