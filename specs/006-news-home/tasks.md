---
description: "Task list for 006 뉴스 홈 (W-U-01)"
---

# Tasks: 006 뉴스 홈 (W-U-01)

**Input**: `specs/006-news-home/` — plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md

**Branch**: `006-news-home`

**Tests**: `src/__tests__/homePage.test.tsx` (plan.md에 명시됨 — Polish 단계에서 생성)

**Format**: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: 병렬 실행 가능 (다른 파일, 미완료 태스크 의존 없음)
- **[Story]**: 해당 User Story (spec.md US1~US4)

---

## Phase 1: Setup (공유 인프라)

**Purpose**: 모든 User Story가 공통으로 의존하는 타입·상수·목데이터·검색 스텁 등록

- [X] T001 [P] `src/types/news.ts` 확장 — `NewsItem` 인터페이스에 `isBreaking?: boolean` 필드 추가 (data-model.md NewsArticle 기준)
- [X] T002 [P] `src/constants/categories.ts` 확장 — `HOME_CATEGORY_FILTERS`(`['전체','기술','경제','정치','스포츠','문화'] as const`)와 `HomeCategoryFilter` 타입 export 추가 (기존 `CAT_COLOR`/`CAT_FALLBACK` 수정 없음)
- [X] T003 `src/mocks/newsHome.mock.ts` 신규 — `TrendingKeyword`·`AIBriefing` 인터페이스 정의; `NEWS_HOME`(12건 이상, `isBreaking: true` 1건, 한 카테고리는 0건 기사로 `EmptyState` 테스트 가능하게 구성)·`TRENDING_KEYWORDS`(Top5)·`AI_BRIEFING` export (T001·T002 완료 후)
- [X] T004 [P] `/search` 빈 스텁 등록 — `src/pages/user/SearchResultsPage.tsx` 신규 ("검색 결과 (준비 중)" 텍스트만 표시, 스타일은 `UserGnbLayout` 내부); `src/app/router.tsx`에 `lazyPage(() => import('@/pages/user/SearchResultsPage'))` 패턴으로 `/search` 라우트 추가 (기존 `/articles/:id` 스텁과 동일 패턴)

**Checkpoint**: 타입·상수·목데이터·검색 라우트 준비 완료 → Phase 2로 진행

---

## Phase 2: Foundational (페이지 레이아웃 셸)

**Purpose**: 모든 User Story 컴포넌트가 마운트될 `HomePage` 외곽 레이아웃을 먼저 확립 — US별 슬라이스를 순차로 붙일 수 있는 뼈대

**⚠️ CRITICAL**: Phase 1 완료 후 진행

- [X] T005 `src/pages/user/HomePage.tsx` 레이아웃 셸 구현 — 기존 placeholder 교체: 외곽 `<div className="max-w-[1320px] mx-auto px-8 py-6">`; 내부 `<div className="flex flex-col xl:grid xl:grid-cols-12 xl:gap-6">`; 본문 영역 `<main className="xl:col-span-8">` + 위젯 영역 `<aside className="xl:col-span-4">`; `NEWS_HOME`·`TRENDING_KEYWORDS`·`AI_BRIEFING` import; 카테고리 필터 `useState<string>('전체')` 초기화; 각 US 섹션은 `{/* TODO: US1~US4 */}` 주석 placeholder로 유지

**Checkpoint**: 빈 2단 레이아웃 셸 렌더 확인 → User Story 구현 시작 가능

---

## Phase 3: User Story 1 — 핵심 속보 배너 (Priority: P1) 🎯 MVP

**Goal**: 페이지 최상단에 속보 1건(제목·출처·시간)과 "바로 읽기" 진입 버튼 표시

**Independent Test**: quickstart.md S-1 — 배너 렌더·"바로 읽기" 클릭 → `/articles/:id` 이동

- [X] T006 [P] [US1] `src/components/features/news/BreakingBanner.tsx` 신규 — `BreakingBannerProps`(`article: NewsItem, onOpen: (id: string) => void`) 구현; `Icon` 속보 배지·제목·출처·시간·"바로 읽기" `<button onClick={() => onOpen(article.id)}`; 단일 인터랙티브 요소(중첩 없음); `aria-label` 포함
- [X] T007 [US1] `src/pages/user/HomePage.tsx` US1 연결 — `NEWS_HOME`에서 `isBreaking: true`인 첫 번째 항목 선택(없으면 `NEWS_HOME[0]` 폴백); `<BreakingBanner>` 렌더; `onOpen` → `navigate(\`/articles/\${id}\`)`; US1 placeholder 주석 교체

**Checkpoint**: `pnpm dev` → `/home` 진입 시 배너 표시·클릭 이동 확인 (User Story 1 독립 완료)

---

## Phase 4: User Story 2 — 카테고리 필터 + 뉴스 카드 그리드 (Priority: P1)

**Goal**: 6개 카테고리 필터 탭 + `auto-fill` 카드 그리드 (AI 요약·stretched-link 패턴)

**Independent Test**: quickstart.md S-2 — 필터 전환·건수 갱신·EmptyState·카드 클릭 이동

- [X] T008 [P] [US2] `src/components/features/news/CategoryFilter.tsx` 신규 — `CategoryFilterProps`(`categories: readonly string[], active: string, onChange: (cat: string) => void, resultCount: number`) 구현; `HOME_CATEGORY_FILTERS` 탭 렌더; 활성 탭 `aria-pressed`; "N건" 표시; `<button>` 그룹 (role 불필요)
- [X] T009 [P] [US2] `src/components/features/news/NewsHomeCard.tsx` 신규 — `NewsHomeCardProps`(`article: NewsItem, bookmarked: boolean, onOpen: (id: string) => void, onToggleBookmark: (id: string) => void`) 구현; stretched-link 패턴(R-05): 카드 `<div className="relative">` 안에 `<Link to={...} className="absolute inset-0 z-0" aria-label={article.title}>` + 나머지 콘텐츠 `<div className="pointer-events-none">` 래퍼; 북마크 `<button className="relative z-10 ..." aria-label="북마크" aria-pressed={bookmarked}>` 형제(중첩 없음); `ImgPlaceholder`·`CatBadge`·제목·AI 요약(`summary`)·출처·시간·조회수 렌더
- [X] T010 [US2] `src/components/features/news/NewsHomeGrid.tsx` 신규 — `NewsHomeGridProps`(`articles: NewsItem[], bookmarkedIds: Set<string>, onOpenArticle: (id: string) => void, onToggleBookmark: (id: string) => void, emptyTitle: string, emptySub: string`) 구현; `articles.length === 0` → `EmptyState`; 그 외 → `<div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">`에 `NewsHomeCard` 나열 (`bookmarked={bookmarkedIds.has(article.id)}` 전달) (T009 완료 후)
- [X] T011 [US2] `src/pages/user/HomePage.tsx` US2 연결 — `useMemo`로 `active === '전체'` 전체·그 외 `.filter(a => a.cat === active)` 계산; `<CategoryFilter categories={HOME_CATEGORY_FILTERS} active={active} onChange={setActive} resultCount={filtered.length}>`; `<NewsHomeGrid articles={filtered} ...>` 렌더; `onOpenArticle` → `navigate(\`/articles/\${id}\`)`; US2 placeholder 교체 (T008·T010 완료 후)

**Checkpoint**: 필터 탭 전환 → 카드 목록 갱신·건수 표시·EmptyState·카드 클릭 이동 동작 확인 (User Story 2 독립 완료)

---

## Phase 5: User Story 3 — 북마크 토글 + 토스트 피드백 (Priority: P2)

**Goal**: 카드 우상단 북마크 버튼 클릭 → 아이콘 상태 전환 + 토스트 피드백 (in-memory, 새로고침 시 초기화)

**Independent Test**: quickstart.md S-3 step 1·3 (토글·토스트만 — 새로고침 유지 단계 제외)

- [X] T012 [P] [US3] `src/components/features/news/NewsHomeCard.tsx` 갱신 — `bookmarked` prop에 따라 북마크 아이콘 filled(`bookmark-fill` 등) / outline 상태 전환; `onToggleBookmark` prop 연결: `<button onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleBookmark(article.id); }}>` (Link 위 z-index로 floating)
- [X] T013 [P] [US3] `src/components/features/news/NewsHomeGrid.tsx` 갱신 — `bookmarkedIds: Set<string>` 수신 확인(Phase 4에서 이미 선언됨); 각 `NewsHomeCard`에 `onToggleBookmark` prop 전달 스레딩 확인 (T012 반영 후 타입 일치 확인)
- [X] T014 [US3] `src/pages/user/HomePage.tsx` 북마크 상태·토스트 연결 — `const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())`; `toggleBookmark(id: string): void` 함수: `Set` 복사·`has(id)` 확인·add/delete·`setBookmarkedIds(next)`·`showToast(nowBookmarked ? '북마크에 저장했어요' : '북마크를 해제했어요', { icon: '🔖', tone: 'ok' })` 호출 (`showToast` import from `@/components/ui/toastBus`); `NewsHomeGrid`에 `bookmarkedIds={bookmarkedIds}`·`onToggleBookmark={toggleBookmark}` 전달 (T012·T013 완료 후)

**Checkpoint**: 북마크 버튼 클릭 → 아이콘 변경 + 토스트 표시; 새로고침 시 초기화 (정상 동작, 이번 단계 비영속) (User Story 3 독립 완료)

---

## Phase 6: User Story 4 — 위젯 패널 (Priority: P2)

**Goal**: 우측 패널에 인기 키워드 Top5·속보 타임라인·AI 브리핑 3개 위젯 표시 및 이동

**Independent Test**: quickstart.md S-4 — 3위젯 표시·키워드 클릭 → `/search`·속보 클릭 → `/articles/:id`·AI 브리핑 클릭 동작 없음

- [X] T015 [P] [US4] `src/components/features/news/TrendingKeywordsWidget.tsx` 신규 — `TrendingKeywordsWidgetProps`(`keywords: TrendingKeyword[], onPick: (keyword: string) => void`) 구현; `Card`+`CardHead`(title="지금 뜨는 키워드", right에 LIVE 배지); 각 행 `<button onClick={() => onPick(kw.keyword)}>`; 순위·키워드·언급량·증감(▲▼—)·progress bar; **progress bar 폭만** `style={{ width: \`\${pct}%\` }}` 인라인 예외(R-04 — 연속값이라 Tailwind 토큰 표현 불가, plan.md Constraints 근거); 색상·간격·radius는 Tailwind 토큰
- [X] T016 [P] [US4] `src/components/features/news/BreakingTimelineWidget.tsx` 신규 — `BreakingTimelineWidgetProps`(`items: NewsItem[], onOpen: (id: string) => void`) 구현; `Card pad={false}`; `NEWS_HOME` 최신순 상위 5개(R-06 — 별도 BREAKING 배열 없음); 각 행 `<button onClick={() => onOpen(item.id)}>` (시간·cat 배지·헤드라인)
- [X] T017 [P] [US4] `src/components/features/news/AIBriefingWidget.tsx` 신규 — `AIBriefingWidgetProps`(`briefing: AIBriefing`) 구현; `Card`+`CardHead`(sparkles `Icon`); `briefing.sentences` 문장 목록; `briefing.generatedAt` 푸터; 클릭 동작 없음(US4 AC4)
- [X] T018 [US4] `src/pages/user/HomePage.tsx` US4 연결 — `<aside className="xl:col-span-4">`에 `<TrendingKeywordsWidget keywords={TRENDING_KEYWORDS} onPick={kw => navigate(\`/search?keyword=\${encodeURIComponent(kw)}\`)}>`·`<BreakingTimelineWidget items={NEWS_HOME.slice(0,5)} onOpen={id => navigate(\`/articles/\${id}\`)}>` · `<AIBriefingWidget briefing={AI_BRIEFING}>` 렌더; US4 placeholder 교체 (T015·T016·T017 완료 후)

**Checkpoint**: 우측 패널 3위젯 렌더·키워드 클릭 `/search` 이동·속보 클릭 `/articles/:id` 이동 확인 (User Story 4 독립 완료)

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: 반응형 최종 확인·접근성·테스트·quickstart 문서 정합

- [X] T019 [P] `specs/006-news-home/quickstart.md` S-3 수정 — "새로고침 후 상태 유지" 단계(step 2·4)를 "새로고침 시 초기화(이번 단계 비영속, 후속 단계에서 영속 구현)" 기준으로 수정; `LocalStorage newsift-bookmarks 확인` 항목 제거
- [X] T020 [P] `src/__tests__/homePage.test.tsx` 신규 — vitest + React Testing Library; ① `BreakingBanner` 제목 렌더·"바로 읽기" 클릭 navigate 호출; ② `CategoryFilter` 탭 선택 → `onChange` 호출·`aria-pressed` 상태; ③ `NewsHomeGrid` EmptyState 렌더(빈 배열); ④ `NewsHomeCard` 북마크 버튼 클릭 → `onToggleBookmark` 호출; ⑤ `TrendingKeywordsWidget`·`AIBriefingWidget` 렌더 smoke test
- [X] T021 타입·빌드 검증 — `pnpm tsc --noEmit` 전체 신규 파일 타입 에러 0건 확인; `pnpm build` 빌드 성공; `pnpm test src/__tests__/homePage.test.tsx` 통과 (T019·T020 완료 후)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 즉시 시작 가능 — T001·T002·T004는 서로 병렬, T003은 T001·T002 완료 후
- **Phase 2 (Foundational)**: Phase 1 전체 완료 후 (T003 포함)
- **Phase 3 (US1)**: Phase 2 완료 후 시작
- **Phase 4 (US2)**: Phase 2 완료 후 시작 (Phase 3와 독립적으로 병렬 가능)
- **Phase 5 (US3)**: Phase 4 완료 후 시작 (NewsHomeCard·NewsHomeGrid 존재 필요)
- **Phase 6 (US4)**: Phase 2 완료 후 시작 (위젯은 Phase 3·4와 독립 병렬 가능, T018은 Phase 2 이후면 충분)
- **Phase 7 (Polish)**: 전체 US Phase 완료 후

### User Story Dependencies

- **US1 (P1)**: Phase 2 완료 후 독립 시작
- **US2 (P1)**: Phase 2 완료 후 독립 시작 (US1과 병렬 가능)
- **US3 (P2)**: US2(Phase 4) 완료 후 — NewsHomeCard·NewsHomeGrid 갱신 필요
- **US4 (P2)**: Phase 2 완료 후 독립 시작 (US1·US2와 병렬 가능)

### Within Each User Story

- 컴포넌트 신규 파일 태스크 → 페이지 연결 태스크 (예: T006 → T007)
- [P] 표시 컴포넌트끼리는 서로 병렬 실행 가능

### Out of Scope (task 미생성)

- 북마크 영속 저장(localStorage/서버) — 후속 단계 Deferred
- 검색 결과 페이지 실제 구현(필터링·결과 뷰) — 후속 단계 Deferred

---

## Parallel Execution Examples

### Phase 1 병렬

```
동시 실행:
  T001: src/types/news.ts 확장
  T002: src/constants/categories.ts 확장
  T004: SearchResultsPage 스텁 + /search 라우트
순차 (T001·T002 완료 후):
  T003: src/mocks/newsHome.mock.ts 신규
```

### Phase 4 (US2) 병렬

```
동시 실행:
  T008: CategoryFilter.tsx 신규
  T009: NewsHomeCard.tsx 신규
순차 (T009 완료 후):
  T010: NewsHomeGrid.tsx 신규
순차 (T008·T010 완료 후):
  T011: HomePage US2 연결
```

### Phase 6 (US4) 병렬

```
동시 실행:
  T015: TrendingKeywordsWidget.tsx 신규
  T016: BreakingTimelineWidget.tsx 신규
  T017: AIBriefingWidget.tsx 신규
순차 (T015·T016·T017 완료 후):
  T018: HomePage US4 연결
```

---

## Implementation Strategy

### MVP (User Story 1만)

1. Phase 1 완료 (T001–T004)
2. Phase 2 완료 (T005)
3. Phase 3 완료 (T006–T007)
4. **STOP & VALIDATE**: 속보 배너 단독 동작 확인
5. 데모/릴리즈 가능

### Incremental Delivery

1. Phase 1 + Phase 2 → 레이아웃 셸 준비
2. Phase 3 (US1) → 속보 배너 동작 → 검증
3. Phase 4 (US2) → 카테고리 필터 + 카드 그리드 → 검증
4. Phase 5 (US3) → 북마크 토글 + 토스트 → 검증
5. Phase 6 (US4) → 위젯 패널 → 검증
6. Phase 7 (Polish) → 타입 검사 + 테스트 → 최종 확인

---

## Notes

- `[P]` = 다른 파일에 작업, 미완료 선행 태스크 없음 → 병렬 실행 가능
- `[USn]` = 해당 User Story 추적용 라벨
- 북마크: Zustand persist 미사용, `src/pages/user/HomePage.tsx` 내부 `useState<Set<string>>`만
- `/search`: `lazyPage()` 래핑 + 스텁만 — 필터링 구현 없음
- Progress bar `style={{ width }}` 인라인 예외: R-04 + plan.md Constraints에 사전 정당화됨
- `pnpm tsc --noEmit` + `pnpm build` + `pnpm test` 모두 T021에서 최종 통과 확인
