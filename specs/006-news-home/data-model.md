# Data Model: 006 뉴스 홈 (W-U-01)

모든 데이터는 목데이터다(FR-018). 기존 `@/types/news.ts`의 `NewsItem`을 확장해 재사용하고, 그 외 신규 타입은 `src/mocks/newsHome.mock.ts` 옆에 정의한다.

## NewsArticle (기존 `NewsItem` 확장)

`src/types/news.ts`

```ts
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  cat: string;          // '기술' | '경제' | '정치' | '스포츠' | '문화' (CAT_COLOR 키)
  bias: number;          // 본 화면에서는 표시하지 않음(FR-005에 BiasChip 요구 없음) — 필드는 유지(다른 화면이 사용)
  time: string;          // 상대 시간 표시 문자열, 예: '12분 전'
  reads: number;         // 조회수
  summary?: string;      // AI 한 줄 요약 — 카드에 그대로 노출
  content?: string;
  isBreaking?: boolean;  // 신규: 속보 배너 후보 여부 (true인 항목 중 1건을 배너에 표시)
}
```

**검증 규칙**:
- `cat`은 `HOME_CATEGORY_FILTERS`(전체 제외) 중 하나여야 한다.
- `summary`가 없으면 카드의 AI 요약 영역은 렌더하지 않는다(목데이터는 전부 채워 제공하므로 런타임에서 실제로 마주칠 일은 없음 — 타입상 optional만 유지).
- `isBreaking: true`인 항목이 여러 개면 배열 순서상 첫 항목을 핵심 속보로 사용한다.

## Category (필터 기준)

`src/constants/categories.ts` (신규 export 추가, 기존 `CAT_COLOR`/`CAT_FALLBACK`는 변경 없음)

```ts
export const HOME_CATEGORY_FILTERS = ['전체', '기술', '경제', '정치', '스포츠', '문화'] as const;
export type HomeCategoryFilter = (typeof HOME_CATEGORY_FILTERS)[number];
```

## TrendingKeyword

`src/mocks/newsHome.mock.ts`

```ts
export interface TrendingKeyword {
  rank: number;     // 1~5
  keyword: string;
  count: number;     // 언급량
  delta: number;     // 전 시점 대비 증감 (양수: ▲, 음수: ▼, 0: —)
}
```

## BreakingTimelineItem (파생, 별도 저장 없음)

독립 엔티티/배열이 아니라 `NewsArticle[]`(최신순 상위 5개)을 그대로 위젯에 전달해 표시한다(research.md R-06). 위젯이 필요로 하는 필드(`time`, `cat`, `title`, `id`)는 모두 `NewsArticle`에 이미 존재한다.

## AIBriefing

`src/mocks/newsHome.mock.ts`

```ts
export interface AIBriefing {
  sentences: string[];   // 오늘의 AI 브리핑 요약 문장 묶음
  generatedAt: string;   // 표시용 텍스트, 예: '오늘 09:00 기준'
}
```

## BookmarkState (비영속 in-memory 상태)

`src/pages/user/HomePage.tsx` 내부 `useState<Set<string>>`

```ts
// HomePage 내부에서만 사용 — 별도 파일/스토어 없음
const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

function toggleBookmark(id: string): boolean {
  const next = new Set(bookmarkedIds);
  const nowBookmarked = !bookmarkedIds.has(id);
  if (nowBookmarked) next.add(id); else next.delete(id);
  setBookmarkedIds(next);
  return nowBookmarked; // 호출부가 토스트 문구 분기에 사용
}
```

- 새로고침 시 초기화(새 `Set()` 시작).
- 영속 저장(localStorage/서버)은 후속 단계로 이관.
- `NewsHomeGrid`/`NewsHomeCard`에 `bookmarkedIds: Set<string>`으로 prop 전달.

## 목데이터 구성 요약

`src/mocks/newsHome.mock.ts`가 export하는 것:

| export | 타입 | 용도 |
|---|---|---|
| `NEWS_HOME` | `NewsItem[]` | 본문 카드 그리드, 배너(`isBreaking`), 속보 타임라인(파생) |
| `TRENDING_KEYWORDS` | `TrendingKeyword[]` | 인기 키워드 Top5 위젯 |
| `AI_BRIEFING` | `AIBriefing` | 오늘의 AI 브리핑 위젯 |
