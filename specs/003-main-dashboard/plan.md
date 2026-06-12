# Implementation Plan: 003 메인 대시보드 (W-01)

**Branch**: `003-main-dashboard` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

---

## Summary

DashboardPage(`/`)에 StatCard 4종 + 카테고리 바차트 + 뉴스 피드 10개를 구현한다.
003 단계는 mock 데이터(`src/mocks/dashboard.mock.ts`, 500ms 딜레이)로 동작하며,
각 영역은 로딩/에러/빈 상태를 독립적으로 처리한다.
커스텀 훅(`useDashboardStats`, `useCategoryChart`, `useNewsFeed`) 내부만 교체하면 이후 실제 API 연동이 가능하다.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**:
- React 19 + Vite 8 (기존)
- react-router-dom v7 (기존)
- Tailwind CSS v4 (기존)
- clsx ← **신규 설치 필요**
- recharts ← **신규 설치 필요**
- date-fns ← **신규 설치 필요**

**Storage**: N/A (mock 데이터, 이후 REST API)

**Testing**: 자동 검증 스크립트 (`scripts/verify-003.mjs`, puppeteer-core)

**Target Platform**: Web SPA (Chrome/Safari/Firefox 최신)

**Project Type**: Web Dashboard (SPA)

**Performance Goals**: 초기 렌더 시 500ms 이내 스켈레톤 표시

**Constraints**: `any` 타입 금지, inline style 금지, console.log 커밋 금지

---

## Constitution Check

| 원칙 | 확인 사항 | 상태 |
|------|-----------|------|
| I. Architecture Boundary | mock 데이터를 백엔드 소스에서 추론하지 않음. `src/types/dashboard.ts` 임시 정의 | ✅ |
| II. API Contract First | 003은 mock 단계. 실제 연동 시 `/generated/api-types.ts`로 교체 예정 (코드에 TODO 주석) | ✅ |
| III. Complete State Handling | StatCard·Chart·Feed 각각 로딩/에러/빈 상태 처리 필수. ErrorBoundary 섹션별 적용 | ✅ |
| IV. Type Safety | `any` 금지. 훅 반환 타입 `UseQueryResult<T>` 명시. `unknown` + 타입 가드 사용 | ✅ |
| V. Accessibility | 뉴스 카드 `<article>` 사용, 썸네일 alt 텍스트 필수, 재시도 버튼 aria-label, 차트 aria-label | ✅ |

---

## 의존성 다이어그램

```
003-01 (Setup: pnpm add + Icon.tsx 아이콘 + ErrorBoundary + category.ts)
  ├── 003-02 [P] src/types/dashboard.ts
  │     └── 003-03 src/mocks/dashboard.mock.ts
  │           ├── 003-04 [P] src/hooks/useDashboardStats.ts
  │           ├── 003-05 [P] src/hooks/useCategoryChart.ts
  │           └── 003-06 [P] src/hooks/useNewsFeed.ts
  │                 ├── 003-07 [P] StatCard.tsx + StatCardSkeleton.tsx      (003-04 + 003-01)
  │                 ├── 003-08 [P] CategoryChart.tsx + CategoryChartSkeleton (003-05 + 003-01)
  │                 └── 003-09 [P] NewsCard.tsx + NewsFeedSkeleton.tsx      (003-06 + 003-01)
  │                       └── 003-10 NewsFeed.tsx                           (003-09 + 003-01)
  │                             └── 003-11 features/dashboard/index.ts      (003-07 + 003-08 + 003-10)
  │                                   └── 003-12 DashboardPage.tsx 수정     (003-11)
  │                                         └── 003-13 router.tsx lazy 교체 (003-12)
  │                                               └── 003-14 verify-003.mjs  (003-13)
  └── (003-02~006은 003-01 완료 후 시작)
```

**병렬 실행 가능 그룹**:
- `003-02`: 003-01 완료 즉시 시작 가능
- `003-04`, `003-05`, `003-06`: 003-03 완료 후 동시 시작
- `003-07`, `003-08`, `003-09`: 각 훅 + 003-01 완료 후 동시 시작

---

## Phase 1 — Setup (003-01)

**파일**:
- `package.json` — pnpm add
- `src/components/ui/Icon.tsx` — 수정 (아이콘 5개 추가)
- `src/components/common/ErrorBoundary.tsx` — **신규 생성**
- `src/constants/category.ts` — **신규 생성**

### Step 1 — 패키지 설치

```bash
pnpm add clsx recharts date-fns
```

### Step 2 — Icon.tsx 누락 아이콘 추가

아래 5개 아이콘을 `LUCIDE_MAP`에 추가 (import + map 항목 모두):

| 아이콘 | 사용처 |
|--------|--------|
| `Newspaper` | StatCard — 오늘의 뉴스 수 |
| `Tag` | StatCard — 모니터링 키워드 수 |
| `ArrowUpRight` | delta 양수 화살표 |
| `ArrowDownRight` | delta 음수 화살표 |
| `Minus` | delta=0 표시 |

```ts
// Icon.tsx import 추가
import {
  // 기존 유지...
  Newspaper,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

// LUCIDE_MAP 추가 (기존 항목 유지)
const LUCIDE_MAP = {
  // 기존 유지...
  Newspaper,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
};
```

### Step 3 — ErrorBoundary 생성

```tsx
// src/components/common/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 프로덕션에서는 외부 로거로 전송 (007 인증 스프린트 이후 추가 예정)
    void error;
    void info;
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
```

### Step 4 — constants/category.ts 생성

```ts
// src/constants/category.ts
export interface CategoryMeta {
  label: string;
  className: string;
}

export const CATEGORY_MAP: Record<string, CategoryMeta> = {
  politics:   { label: '정치',   className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  economy:    { label: '경제',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  society:    { label: '사회',   className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  technology: { label: '기술',   className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  culture:    { label: '문화',   className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  sports:     { label: '스포츠', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

export function getCategoryMeta(category: string): CategoryMeta {
  return CATEGORY_MAP[category] ?? {
    label: category,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };
}
```

**완료 조건**:
- `pnpm install` 에러 없음
- `<Icon name="Newspaper" />`, `<Icon name="Tag" />` 렌더 에러 없음
- `ErrorBoundary` TS 에러 없음
- `getCategoryMeta('politics').label === '정치'`

---

## Phase 2 — Types + Mock

### Task 003-02: src/types/dashboard.ts [P with 003-03~06]

**파일**: `src/types/dashboard.ts` — **신규 생성**

```ts
// src/types/dashboard.ts
// TODO: 실제 API 연동 시 /generated/api-types.ts로 교체

export interface DashboardStat {
  id: string;
  label: string;
  icon: string;
  value: number;
  delta: number;
  deltaPercent: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl: string | null;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
```

**완료 조건**: TypeScript 에러 없음, `any` 사용 없음

---

### Task 003-03: src/mocks/dashboard.mock.ts (003-02 이후)

**파일**: `src/mocks/dashboard.mock.ts` — **신규 생성**

- 500ms 딜레이 공통 함수 `delay(ms)`
- `fetchDashboardStats()`: `DashboardStat[]` 4개 반환
- `fetchCategoryChart()`: `CategoryData[]` 6개 반환
- `fetchNewsFeed()`: `NewsItem[]` 10개 반환

```ts
// src/mocks/dashboard.mock.ts
import type { DashboardStat, CategoryData, NewsItem } from '@/types/dashboard';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchDashboardStats(): Promise<DashboardStat[]> {
  await delay(500);
  return [
    { id: 'today-news', label: '오늘의 뉴스 수',       icon: 'Newspaper', value: 247, delta: 23,   deltaPercent: 10.3 },
    { id: 'analyzed',   label: '분석된 기사 수',        icon: 'FileText',  value: 198, delta: 18,   deltaPercent: 10.0 },
    { id: 'bias',       label: '평균 편향 점수',         icon: 'Scale',     value: 3.2, delta: -0.3, deltaPercent: -8.6 },
    { id: 'keywords',   label: '모니터링 중인 키워드 수', icon: 'Tag',       value: 42,  delta: 0,    deltaPercent: 0   },
  ];
}

export async function fetchCategoryChart(): Promise<CategoryData[]> {
  await delay(500);
  return [
    { category: 'politics',   count: 68 },
    { category: 'economy',    count: 54 },
    { category: 'society',    count: 71 },
    { category: 'technology', count: 32 },
    { category: 'culture',    count: 15 },
    { category: 'sports',     count: 7  },
  ];
}

export async function fetchNewsFeed(): Promise<NewsItem[]> {
  await delay(500);
  return Array.from({ length: 10 }, (_, i) => ({
    id: `news-${i + 1}`,
    title: `뉴스 기사 제목 ${i + 1} — 예시 헤드라인입니다`,
    source: ['연합뉴스', 'KBS', 'MBC', '조선일보', '한겨레'][i % 5],
    category: ['politics', 'economy', 'society', 'technology', 'culture', 'sports'][i % 6],
    publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    thumbnailUrl: i % 3 === 0 ? null : `https://picsum.photos/seed/${i + 1}/160/90`,
  }));
}
```

**완료 조건**: TypeScript 에러 없음, `any` 사용 없음

---

## Phase 3 — Hooks (003-04 ~ 003-06, 병렬)

**위치**: `src/hooks/`

공통 패턴:

```ts
import { useState, useEffect, useCallback } from 'react';
import type { UseQueryResult } from '@/types/dashboard';

export function useXxx(): UseQueryResult<XxxType[]> {
  const [data, setData] = useState<XxxType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await fetchXxx();
      setData(result);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, isLoading, isError, refetch: fetch };
}
```

### Task 003-04: useDashboardStats.ts [P]

- import: `fetchDashboardStats` from `@/mocks/dashboard.mock`
- 반환: `UseQueryResult<DashboardStat[]>`

### Task 003-05: useCategoryChart.ts [P]

- import: `fetchCategoryChart` from `@/mocks/dashboard.mock`
- 반환: `UseQueryResult<CategoryData[]>`

### Task 003-06: useNewsFeed.ts [P]

- import: `fetchNewsFeed` from `@/mocks/dashboard.mock`
- 반환: `UseQueryResult<NewsItem[]>`

**완료 조건** (공통): TypeScript 에러 없음, `refetch` 호출 시 재조회

---

## Phase 4 — Components (003-07 ~ 003-11)

**위치**: `src/components/features/dashboard/`

---

### Task 003-07: StatCard.tsx + StatCardSkeleton.tsx (003-01 + 003-04 이후)

#### StatCardSkeleton

```tsx
// shimmer: relative overflow-hidden bg-white/5 rounded-xl
// before: absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]
//         bg-gradient-to-r from-transparent via-white/10 to-transparent
// 필요 시 tailwind.config.ts에 shimmer keyframe 추가
```

Shimmer keyframe (tailwind.config.ts 확인 후 없으면 추가):
```ts
// tailwind.config.ts extend.keyframes
shimmer: {
  '100%': { transform: 'translateX(100%)' },
},
// extend.animation
shimmer: 'shimmer 1.5s infinite',
```

#### StatCard

```tsx
interface StatCardProps {
  stat: DashboardStat;
}

// delta 색상 clsx 패턴
const deltaClass = clsx({
  'text-green-500': stat.delta > 0,
  'text-red-500':   stat.delta < 0,
  'text-gray-400':  stat.delta === 0,
});

// delta 방향 아이콘
const deltaIcon = stat.delta > 0 ? 'ArrowUpRight' : stat.delta < 0 ? 'ArrowDownRight' : 'Minus';
```

**레이아웃**:
```
<article aria-label={stat.label}>
  bg-white/5 rounded-xl p-5 flex flex-col gap-3
  ├── 상단: Icon(stat.icon, size=20, className="text-brand") + <h3>{stat.label}</h3>
  ├── 수치: text-3xl font-bold text-ink
  └── delta: <Icon name={deltaIcon}> + deltaPercent% (deltaClass)
```

**완료 조건**: 4종 카드 렌더 에러 없음, delta 색상 clsx 분기 정상

---

### Task 003-08: CategoryChart.tsx + CategoryChartSkeleton.tsx (003-01 + 003-05 이후)

```tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { getCategoryMeta } from '@/constants/category';

// CategoryChartSkeleton: shimmer 박스 (h-[240px])

// CategoryChart
// data가 모두 count===0이면 Empty State: "아직 집계된 데이터가 없습니다."
// 에러: ErrorBoundary 외부에서 isError prop으로 처리 (에러 메시지 + 재시도)

// XAxis dataKey="category"를 한글 레이블로 변환:
//   tickFormatter={(v) => getCategoryMeta(v).label}

// 차트 aria-label="카테고리별 뉴스 분포"
```

**완료 조건**: SVG 렌더, 6개 카테고리, 에러/빈 상태 분기

---

### Task 003-09: NewsCard.tsx + NewsFeedSkeleton.tsx (003-01 + 003-06 이후)

#### NewsFeedSkeleton

- 10개 shimmer 카드 (thumbnail 영역 + 텍스트 줄 3개)

#### NewsCard

```tsx
interface NewsCardProps {
  item: NewsItem;
}
```

- `<article>` 래퍼 (semantic HTML)
- 썸네일 처리:

```tsx
const [imgError, setImgError] = useState(false);
const showFallback = !item.thumbnailUrl || imgError;

{showFallback ? (
  <div className="w-40 h-[90px] bg-white/10 flex items-center justify-center rounded-lg shrink-0">
    <Icon name="Newspaper" size={24} className="text-ink-400" aria-hidden="true" />
  </div>
) : (
  <img
    src={item.thumbnailUrl}
    alt={item.title}
    loading="lazy"
    className="w-40 h-[90px] object-cover rounded-lg shrink-0"
    onError={() => setImgError(true)}
  />
)}
```

- 카테고리 배지: `getCategoryMeta(item.category).className`
- 발행 시간: `formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true, locale: ko })`
- 클릭: `<Link to={/articles/${item.id}}>` (react-router-dom)

**완료 조건**: 썸네일 fallback 렌더 정상, date-fns 상대 시간, 클릭 이동

---

### Task 003-10: NewsFeed.tsx (003-09 이후)

```tsx
interface NewsFeedProps {
  items: NewsItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
```

- isLoading → `<NewsFeedSkeleton />`
- isError → "뉴스를 불러올 수 없습니다." + 재시도 버튼 (onClick: refetch)
- items.length === 0 → "표시할 뉴스가 없습니다." + `<Icon name="Inbox" />`
- items > 0 → `<ul>` + `{items.map(item => <li><NewsCard item={item} /></li>)}`

**완료 조건**: 3가지 상태 분기 정상

---

### Task 003-11: features/dashboard/index.ts (barrel export)

```ts
// src/components/features/dashboard/index.ts
export { default as StatCard } from './StatCard';
export { default as StatCardSkeleton } from './StatCardSkeleton';
export { default as CategoryChart } from './CategoryChart';
export { default as CategoryChartSkeleton } from './CategoryChartSkeleton';
export { default as NewsCard } from './NewsCard';
export { default as NewsFeed } from './NewsFeed';
export { default as NewsFeedSkeleton } from './NewsFeedSkeleton';
```

---

## Phase 5 — Integration (003-12 ~ 003-13)

### Task 003-12: DashboardPage.tsx 수정 (003-11 이후)

**파일**: `src/pages/DashboardPage.tsx` — 기존 플레이스홀더 교체

```tsx
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCategoryChart } from '@/hooks/useCategoryChart';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import {
  StatCard, StatCardSkeleton,
  CategoryChart, CategoryChartSkeleton,
  NewsFeed,
} from '@/components/features/dashboard';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function DashboardPage() {
  const stats = useDashboardStats();
  const chart = useCategoryChart();
  const feed = useNewsFeed();

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* StatCard 그리드 */}
      <section aria-label="통계 현황">
        <ErrorBoundary fallback={<p className="text-ink-400 text-sm">데이터를 불러올 수 없습니다.</p>}>
          {stats.isError ? (
            <p className="text-ink-400 text-sm">데이터를 불러올 수 없습니다.</p>
          ) : stats.isLoading || !stats.data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.data.map((s) => <StatCard key={s.id} stat={s} />)}
            </div>
          )}
        </ErrorBoundary>
      </section>

      {/* 카테고리 바차트 */}
      <section aria-label="카테고리별 뉴스 분포">
        <ErrorBoundary fallback={<p className="text-ink-400 text-sm">데이터를 불러올 수 없습니다.</p>}>
          {chart.isLoading || !chart.data ? (
            <CategoryChartSkeleton />
          ) : (
            <CategoryChart
              data={chart.data}
              isError={chart.isError}
              refetch={chart.refetch}
            />
          )}
        </ErrorBoundary>
      </section>

      {/* 뉴스 피드 */}
      <section aria-label="최신 뉴스">
        <ErrorBoundary fallback={<p className="text-ink-400 text-sm">뉴스를 불러올 수 없습니다.</p>}>
          <NewsFeed
            items={feed.data ?? []}
            isLoading={feed.isLoading}
            isError={feed.isError}
            refetch={feed.refetch}
          />
        </ErrorBoundary>
      </section>
    </div>
  );
}
```

**완료 조건**: 3개 섹션 독립 에러 처리, aria-label 부착

---

### Task 003-13: router.tsx + AppShell.tsx — lazy 교체 (003-12 이후)

**목적**: DashboardPage를 `React.lazy`로 교체하여 번들 분할. Suspense는 AppShell의 `<main>` 내부에 배치.

#### AppShell.tsx 수정

```tsx
// 기존
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/nav';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

// 수정 후 — Suspense 추가
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/nav';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<FullPageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
```

#### router.tsx 수정

```tsx
// 기존
import DashboardPage from '@/pages/DashboardPage';

// 수정 후
import { lazy } from 'react';
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
```

> 다른 페이지(TrendsPage 등)는 이후 스프린트에서 lazy 전환 예정 — 003에서는 DashboardPage만 교체.

**완료 조건**: `pnpm dev` 에러 없음, `/` 접근 시 FullPageSpinner 잠깐 표시 후 DashboardPage 렌더

---

## Phase 6 — 검증 (003-14)

### Task 003-14: scripts/verify-003.mjs 작성 및 실행

**파일**: `scripts/verify-003.mjs` — **신규 생성**

- puppeteer-core + 시스템 Chrome 사용 (verify-002.mjs 패턴 동일)
- S-01~S-07 시나리오 자동 검증
- S-06, S-07: `src/mocks/dashboard.mock.ts` 수정 → 2800ms 대기 → `page.goto()` → try/finally 원복
- 출력: `S-01 · 설명  ✅ PASS / ❌ FAIL`

**시나리오 매핑**:

| ID | 검증 내용 | 방법 |
|----|----------|------|
| S-01 | StatCard 4종 텍스트 확인 | DOM 텍스트 포함 여부 |
| S-02 | delta 색상 클래스 확인 | `text-green-*`, `text-red-*`, `text-gray-*` |
| S-03 | 카테고리 바차트 SVG 렌더 | `.recharts-wrapper` 존재 여부 |
| S-04 | 뉴스 피드 article 10개 | `querySelectorAll` count |
| S-05 | 뉴스 카드 클릭 → /articles/ | URL 패턴 확인 |
| S-06 | 에러 상태 — "데이터를 불러올 수 없습니다." | mock 수정 후 텍스트 확인 |
| S-07 | 빈 상태 — "표시할 뉴스가 없습니다." | mock 수정 후 텍스트 확인 |

**완료 조건**: `node scripts/verify-003.mjs` → 7/7 PASS

---

## Complexity Tracking

| 태스크 | 위반 가능 원칙 | 복잡도 사유 | 해결 방안 |
|--------|--------------|------------|----------|
| 003-01 | IV. Type Safety | `Icon.tsx` LUCIDE_MAP 타입이 `Record<string, LucideComponent>`라 임의 키 추가 가능 | 기존 패턴 유지 (001에서 확립된 방식), 추가 시 import도 동시 추가 필수 |
| 003-03 | II. API Contract | mock 구조가 실제 API 응답과 다를 수 있음 | `src/types/dashboard.ts`에 TODO 주석으로 교체 시점 명시 |
| 003-07 | III. Complete State | delta=0 케이스 별도 처리 누락 위험 | `clsx` 3분기 명시 (`> 0`, `< 0`, `=== 0`) |
| 003-08 | V. Accessibility | Recharts 차트 기본 aria 지원 미흡 | `BarChart aria-label` + `<title>` 요소 추가 |
| 003-09 | V. Accessibility | 썸네일 alt 텍스트 — null URL 케이스에서 `alt=""` 필수 | `showFallback` 분기 시 fallback div에는 aria-hidden |
| 003-12 | III. Complete State | `ErrorBoundary` fallback 범위 결정 | 섹션별 독립 감싸기 (StatCard/Chart/Feed 각각) |
| 003-13 | — | `React.lazy` + `Suspense` 위치 결정 | AppShell `<main>` 내부에 배치 — Sidebar는 즉시 렌더 보장 |
| 003-14 | — | S-06/S-07 mock 파일 수정 패턴 (HMR 의존성) | try/finally 원복 필수, 2800ms sleep으로 Vite 재컴파일 대기 |

---

## Project Structure (003 산출물)

```
src/
├── types/
│   └── dashboard.ts              ← 신규 (003-02)
├── mocks/
│   └── dashboard.mock.ts         ← 신규 (003-03)
├── hooks/
│   ├── useDashboardStats.ts      ← 신규 (003-04)
│   ├── useCategoryChart.ts       ← 신규 (003-05)
│   └── useNewsFeed.ts            ← 신규 (003-06)
├── components/
│   ├── common/
│   │   └── ErrorBoundary.tsx     ← 신규 (003-01)
│   └── features/
│       └── dashboard/
│           ├── StatCard.tsx          ← 신규 (003-07)
│           ├── StatCardSkeleton.tsx  ← 신규 (003-07)
│           ├── CategoryChart.tsx     ← 신규 (003-08)
│           ├── CategoryChartSkeleton.tsx ← 신규 (003-08)
│           ├── NewsCard.tsx          ← 신규 (003-09)
│           ├── NewsFeedSkeleton.tsx  ← 신규 (003-09)
│           ├── NewsFeed.tsx          ← 신규 (003-10)
│           └── index.ts             ← 신규 (003-11)
├── constants/
│   └── category.ts               ← 신규 (003-01)
├── layouts/
│   └── AppShell.tsx              ← 수정 (003-13, Suspense 추가)
├── pages/
│   └── DashboardPage.tsx         ← 수정 (003-12)
└── router.tsx                    ← 수정 (003-13, lazy 교체)

scripts/
└── verify-003.mjs                ← 신규 (003-14)
```
