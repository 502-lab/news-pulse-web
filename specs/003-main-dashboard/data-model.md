# Data Model: 003 메인 대시보드 (W-01)

**Date**: 2026-06-12

> 003 단계는 mock 데이터 사용. 실제 API 연동 시 `src/types/dashboard.ts`의 타입을 `/generated/api-types.ts`로 교체.

---

## 엔티티

### DashboardStat

단일 StatCard의 표시 데이터.

```ts
interface DashboardStat {
  id: string;            // 카드 식별자 (예: 'today-news', 'analyzed', 'bias', 'keywords')
  label: string;         // 카드 제목 (예: '오늘의 뉴스 수')
  icon: string;          // Icon 컴포넌트에 전달할 아이콘 이름
  value: number;         // 현재 수치
  delta: number;         // 전일 대비 절대 증감 (양수/음수/0)
  deltaPercent: number;  // 전일 대비 % 증감
}
```

**인스턴스 (mock)**:
| id | label | icon | value | delta | deltaPercent |
|----|-------|------|-------|-------|-------------|
| `today-news` | 오늘의 뉴스 수 | `Newspaper` | 247 | +23 | +10.3 |
| `analyzed` | 분석된 기사 수 | `FileText` | 198 | +18 | +10.0 |
| `bias` | 평균 편향 점수 | `Scale` | 3.2 | -0.3 | -8.6 |
| `keywords` | 모니터링 키워드 수 | `Tag` | 42 | 0 | 0 |

---

### CategoryData

카테고리별 오늘의 뉴스 수 집계.

```ts
interface CategoryData {
  category: string;  // 카테고리 키 (예: 'politics', 'economy')
  count: number;     // 오늘의 기사 수
}
```

**인스턴스 (mock)** — 6개 카테고리:
| category | label | count |
|----------|-------|-------|
| `politics` | 정치 | 68 |
| `economy` | 경제 | 54 |
| `society` | 사회 | 71 |
| `technology` | 기술 | 32 |
| `culture` | 문화 | 15 |
| `sports` | 스포츠 | 7 |

---

### NewsItem

뉴스 피드의 개별 기사 항목.

```ts
interface NewsItem {
  id: string;
  title: string;
  source: string;           // 언론사 이름
  category: string;         // CategoryData.category와 동일 키
  publishedAt: string;      // ISO 8601 (예: "2026-06-12T08:30:00Z")
  thumbnailUrl: string | null;
}
```

---

## 상태 머신

각 데이터 훅의 상태 전이:

```
IDLE → LOADING → SUCCESS
              ↘ ERROR → (refetch) → LOADING
```

| 상태 | UI 표현 |
|------|--------|
| LOADING | shimmer 스켈레톤 |
| SUCCESS (data.length > 0) | 실제 데이터 |
| SUCCESS (data.length === 0) | Empty State |
| ERROR | 에러 메시지 + 재시도 버튼 |

---

## 훅 반환 타입

```ts
interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

// 각 훅
useDashboardStats(): UseQueryResult<DashboardStat[]>
useCategoryChart():  UseQueryResult<CategoryData[]>
useNewsFeed():       UseQueryResult<NewsItem[]>
```

---

## 카테고리 → 배지 색상 매핑 (constants/category.ts)

```ts
interface CategoryMeta {
  label: string;
  className: string;  // Tailwind 클래스 (bg-* text-*)
}

Record<string, CategoryMeta>:
  politics  → { label: '정치', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  economy   → { label: '경제', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
  society   → { label: '사회', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
  technology→ { label: '기술', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
  culture   → { label: '문화', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  sports    → { label: '스포츠', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
  (default) → { label: category, className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
```
