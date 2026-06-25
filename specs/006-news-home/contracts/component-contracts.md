# Component Contracts: 006 뉴스 홈 (W-U-01)

이 기능은 백엔드 API를 호출하지 않으므로(FR-018, 전부 목데이터) API 계약은 없다. 대신 신규 화면 전용 컴포넌트의 props 계약을 정의해 `/speckit-tasks` 단계에서 그대로 작업 항목으로 옮길 수 있게 한다. 모든 컴포넌트는 내부적으로 `src/components/ui/*` 프리미티브를 재사용한다(FR-017).

## BreakingBanner

```ts
interface BreakingBannerProps {
  article: NewsItem;       // isBreaking=true인 항목(없으면 NEWS_HOME[0])
  onOpen: (id: string) => void; // navigate(`/articles/${id}`)
}
```
- 내부: `Icon`(속보 배지), 네이티브 `<button>`("바로 읽기") — 단일 액션이라 중첩 문제 없음.

## CategoryFilter

```ts
interface CategoryFilterProps {
  categories: readonly string[]; // HOME_CATEGORY_FILTERS
  active: string;
  onChange: (cat: string) => void;
  resultCount: number;           // "N건" 표시
}
```
- 내부: 네이티브 `<button>` 그룹(`role` 불필요, 단순 토글 버튼 묶음). 활성 상태는 `aria-pressed`로 표현.

## NewsHomeCard

```ts
interface NewsHomeCardProps {
  article: NewsItem;
  bookmarked: boolean;
  onOpen: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}
```
- 내부 마크업(R-05, stretched-link 패턴):
  - 카드 열기: `<Link to={...} className="absolute inset-0" aria-label={article.title}>` (또는 `<button>`, 형제 관계만 지키면 무방)
  - 보이는 콘텐츠: `ImgPlaceholder`, `CatBadge`, 제목, AI 요약, 출처/시간/조회수 — `pointer-events-none` 래퍼로 클릭을 아래 링크로 통과시킴
  - 북마크: 형제 `<button aria-label="북마크" aria-pressed={bookmarked}>` + `Icon name="bookmark"`, `z-index`로 링크 위에 둠
- `BiasChip`은 사용하지 않음(spec FR-005에 요구 없음).

## NewsHomeGrid

```ts
interface NewsHomeGridProps {
  articles: NewsItem[];          // 이미 카테고리로 필터된 목록
  bookmarkedIds: Set<string>;
  onOpenArticle: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  emptyTitle: string;
  emptySub: string;
}
```
- `articles.length === 0`이면 `EmptyState` 렌더, 아니면 `grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4` 안에 `NewsHomeCard` 나열(plan.md 반응형 설계 절 참고).

## TrendingKeywordsWidget

```ts
interface TrendingKeywordsWidgetProps {
  keywords: TrendingKeyword[];   // 이미 Top5로 잘린 배열
  onPick: (keyword: string) => void; // navigate(`/search?keyword=${keyword}`)
}
```
- 내부: `Card` + `CardHead`(title="지금 뜨는 키워드", right에 LIVE 배지), 각 행은 네이티브 `<button>`(키워드 전체가 클릭 영역) — 중첩 없음.
- 진행률 바 `width`만 inline style 예외 적용(research.md R-04).

## BreakingTimelineWidget

```ts
interface BreakingTimelineWidgetProps {
  items: NewsItem[];              // NEWS_HOME 최신순 상위 5개 (R-06)
  onOpen: (id: string) => void;
}
```
- 내부: `Card pad={false}`, 각 행은 네이티브 `<button>`.

## AIBriefingWidget

```ts
interface AIBriefingWidgetProps {
  briefing: AIBriefing;
}
```
- 클릭 동작 없음(US4 AC4). 내부: `Icon`(sparkles), 문장 목록, `generatedAt` 푸터 텍스트.

## SearchResultsPage (페이지, props 없음 — 빈 스텁)

- `/search?keyword=<kw>` 라우트 등록만 담당하는 빈 스텁 페이지.
- "검색 결과 (준비 중)" 텍스트만 표시. 기존 `/articles/:id` 스텁과 동일한 패턴.
- 실제 구현(필터링, 결과 뷰)은 후속 단계로 이관(R-07).
