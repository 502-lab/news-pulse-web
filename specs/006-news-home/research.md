# Research: 006 뉴스 홈 (W-U-01)

## R-01. 카드 그리드 반응형 — auto-fill minmax(240px,1fr) + xl(1280px) 스택 전환

**Decision**: 카드 그리드는 `grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4`. 본문/위젯 8:4 분할 → 세로 적층 전환폭은 `xl`(1280px).

**Rationale**: plan.md "반응형 설계" 절의 역산 과정대로, 240px는 데스크톱 구간(≥1280px) 전체에서 항상 정확히 3열을 보장하는 가장 큰 값에 가깝다(참조 디자인 카드 폭 257~266px). `xl` 전환폭은 CLAUDE.md가 정의한 desktop/tablet 경계(1280px)이자 이 프로젝트가 이미 다단 레이아웃 분기에 쓰는 관례(`DashboardPage.tsx`, `CommonComponentsPage.tsx`)와 일치한다.

**Alternatives considered**:
- `lg`(1024px) 전환: 위젯 패널이 8:4 분할상 약 280px까지 좁아져 키워드 바·타임라인 가독성이 떨어짐 → 기각.
- minWidth를 높여(예: 292px) 스택 직후 4열 오버슈트를 원천 차단: 그 값에서는 데스크톱 최소 본문 폭(803px)에서 카드가 2열로 떨어져 참조 디자인(3열, SC-008)과 불일치 → 기각.
- 카드 그리드를 별도 `max-width`로 추가 고정(스택 여부와 무관하게 본문 폭을 항상 desktop 폭으로 제한): 사용자가 요청한 "8:4 분할과 별개로 적용되는 폭 제한은 바깥 콘텐츠 컨테이너(1320px)뿐"이라는 범위를 벗어나는 임의 추가 제약이라 기각. 대신 일시적 4열 오버슈트를 research에 명시하고 수용.

## R-02. 분류 체계 — `@/types/news.ts` + `@/constants/categories.ts` (Korean 키) 채택, `@/types/dashboard.ts` 계열 미사용

**Decision**: 006의 기사 데이터는 `@/types/news.ts`의 `NewsItem`(`cat`: '기술'|'경제'|'정치'|'스포츠'|'문화', `bias`, `time`, `reads`, `summary`)을 그대로 쓰고, 카테고리 배지 색상은 `@/constants/categories.ts`의 `CAT_COLOR`(한글 키)를 쓴다.

**Rationale**: 화면에서 재사용하는 공용 컴포넌트(`CatBadge`, `NewsCard`, `BiasChip`)가 이미 이 타입·상수 체계로 구현돼 있다(001-design-token-components에서 참조 프로토타입 `ui.jsx`/`data.jsx`를 그대로 포팅). 반대로 `@/types/dashboard.ts`의 `NewsItem`(영문 카테고리 키, `publishedAt`/`thumbnailUrl`)과 `@/constants/category.ts`(영문 키)는 003 대시보드(`/` 라우트, `features/dashboard/*`) 전용 별도 체계라 호환되지 않는다. 두 체계를 섞으면 `CatBadge`에 영문 키를 넘기는 등 타입 불일치가 생긴다.

**Alternatives considered**: 영문 키 체계로 통일(두 체계 병합) — 003 대시보드 코드까지 같이 고쳐야 해서 006 범위를 벗어남 → 기각, 향후 별도 리팩토링 과제로 남김(이번 plan에서는 손대지 않음).

## R-03. 북마크 상태 — 비영속 in-memory `useState` (이번 단계), 영속 구현은 후속으로 이관

**Decision**: 이번 006 단계에서는 북마크를 `HomePage` 내부 `useState<Set<string>>`으로 관리한다. 토글 시 아이콘 상태 변경 + 토스트 피드백(북마크에 저장했어요/해제했어요)만 제공하며, 새로고침 시 초기화된다. Zustand `persist` 미들웨어와 localStorage 사용은 이번 단계 범위에서 제외한다.

**Rationale**: 이번 단계의 목표는 "화면 내 토글+토스트 피드백"이며 새로고침 후 복원이 요구되지 않으므로, 신규 의존성(Zustand persist 패턴 도입)이나 영속 저장 로직이 불필요하다. 가장 가벼운 React 표준 상태(`useState`)로 충분히 목표를 달성할 수 있다. 영속 저장 방식(localStorage, Zustand persist, 서버 동기화)과 그 구현 도구 선택은 후속 단계 북마크 기능에서 결정한다.

**Alternatives considered**: Zustand `persist` 미들웨어(localStorage 영속) — 이번 단계에서 영속이 요구사항이 아니므로 불필요한 의존성 도입 → 기각, 후속 단계로 이관. 수동 localStorage 직접 접근 — 마찬가지로 이번 단계 범위 밖 → 기각.

## R-04. 인기 키워드 위젯 — Recharts로 강제 변환하지 않음, 진행률 바 width만 inline style 예외

**Decision**: "지금 뜨는 키워드" 위젯은 참조 디자인처럼 순위·키워드·언급량·미니 진행률 바·증감(▲▼)이 한 행에 들어가는 목록으로 구현한다(`Card`+`CardHead` 안에 직접 구성, Recharts 미사용). 진행률 바의 `width`(0~100%)만 `style={{ width: \`${pct}%\` }}`로 적용한다.

**Rationale**: 참조 디자인의 `KeywordBars`는 Recharts가 아니라 순수 div + CSS 너비%로 만든 컴포넌트다(좌표축·범례가 없는 "행 안에 박힌 미니 바"라 Recharts `BarChart`로 표현하면 rank·keyword·count·delta를 한 행에 배치하기 어렵고 부자연스러워짐). `pct` 값은 목데이터에서 매번 계산되는 연속값이라 Tailwind 디자인 토큰(고정 폭 클래스)으로 표현할 방법이 없다 — CLAUDE.md "인라인 style 금지"의 취지는 토큰 대신 임의 디자인값을 쓰는 것을 막는 것이며, 데이터 바인딩 값 1건에 한정한 예외는 그 취지를 벗어나지 않는다. 색상·간격·라운드는 전부 Tailwind 토큰으로 처리한다.

**Alternatives considered**: Recharts 수평 `BarChart`로 전체 위젯을 구현 — 축/범례 없는 "리스트 행" UI를 차트 라이브러리로 표현하면 레이아웃이 부자연스럽고 더 복잡해짐 → 기각.

## R-05. 카드 마크업 — "버튼 안의 버튼" 제거, stretched-link 패턴 채택

**Decision**: `NewsHomeCard`는 카드 전체를 감싸는 `<button>` 대신, ① 카드를 여는 `<Link>`(또는 `<button onClick>`)를 `absolute inset-0`으로 카드 영역 전체에 겹쳐 깔고 ② 북마크 토글은 별도의 형제 `<button>`으로 카드 우상단에 배치한다. 두 인터랙티브 요소는 DOM상 서로 중첩되지 않는 형제 관계다.

**Rationale**: 참조 프로토타입은 `<button onClick=onOpen>` 안에 북마크용 `<span role="button" onClick={stopPropagation+toggle}>`을 넣는 "버튼 안의 버튼" 마크업이라(`screen-newshome.jsx` `NewsHomeCard`), spec FR-015/접근성 요구사항(인터랙티브 요소 중첩 금지)을 위반한다. stretched-link 패턴은 시각적으로는 동일한 결과(카드 전체 클릭 가능 + 우상단 북마크 버튼)를 내면서 마크업만 유효하게 만든다. A-5(디자인 의도만 추출, 코드 그대로 복사 금지)와도 합치한다.

**Alternatives considered**: 카드를 비-인터랙티브 `<div>`로 두고 `onClick`만 부여(키보드 접근 불가) — FR-013(키보드만으로 핵심 동작 수행) 위반 → 기각. 북마크 버튼에 `stopPropagation`만 적용해 중첩 구조 유지 — DOM 구조 자체가 유효하지 않아(`<button>` 안 `<button>`은 HTML 스펙상 금지, 보조기기 동작도 예측 불가) 기각.

## R-06. 속보 타임라인 데이터 — 별도 합성 데이터 없이 동일 목데이터(`NEWS_HOME`)에서 파생

**Decision**: "속보 타임라인" 위젯의 5개 항목은 `NEWS_HOME` 목데이터 배열에서 최신순 상위 N개를 그대로 사용한다(시간·카테고리·헤드라인은 해당 기사 자신의 필드). 참조 프로토타입의 별도 `BREAKING` 배열 + `articleFrom()` 합성 어댑터는 포팅하지 않는다.

**Rationale**: 데이터 소스를 하나로 유지하면(단일 `NEWS_HOME`) 엔티티가 줄고, 타임라인 항목 클릭 시 "해당 기사로 이동"이 항상 실제 존재하는 기사 id로 자연스럽게 연결된다(합성 객체를 만들 필요가 없다). 참조 디자인은 독립된 브라우저 프로토타입이라 화면별로 데이터가 분리돼 있었을 뿐, 우리 코드베이스에서는 굳이 따라갈 이유가 없는 구조다.

**Alternatives considered**: 참조와 동일하게 별도 `BREAKING` 상수 + 합성 객체 — 불필요한 중복 엔티티 → 기각.

## R-07. 인기 키워드 클릭 목적지 — `/search` 라우트 등록 + 빈 스텁, 실제 구현 후속

**Decision**: 인기 키워드 클릭 시 `/search?keyword=<kw>` 라우트로 이동한다. `/search`가 가리키는 `SearchResultsPage`는 "검색 결과 (준비 중)" 텍스트만 있는 빈 스텁 페이지로만 구현한다. 목데이터 기반 클라이언트 필터링, 검색 결과 UI, 결과 건수 표시는 이번 범위에서 제외한다.

**Rationale**: 인기 키워드 클릭 → `/search` 이동 동선(라우트 등록)은 이번 단계 요구사항에 해당하지만, 결과 페이지 전체 구현은 별도 공수가 필요하다. 기존 `/articles/:id` 스텁과 동일한 패턴으로 빈 스텁을 두면 동선이 깨지지 않으면서 구현 범위를 최소화할 수 있다. 검색창(GNB 숨김)과 마찬가지로, 검색 결과 페이지의 실제 구현은 후속 단계 과제다.

**Alternatives considered**: 목데이터 클라이언트 필터링 결과 뷰 구현(`NEWS_HOME`을 키워드로 필터) — 구현 가능하지만 이번 단계 범위 밖으로 명시적으로 제외 → 후속 단계로 이관. 키워드 클릭을 비활성화(동선 미구현) — 라우트 등록 자체를 생략하면 향후 연결이 더 어려워짐 → 기각.

## R-08. 로딩 상태 미구현 — 동기 목데이터 import (003 대시보드의 인위적 delay 패턴 미적용)

**Decision**: `src/mocks/newsHome.mock.ts`는 Promise/delay 없이 동기적으로 값을 export한다. `useState`/`useEffect`로 감싸지 않고 모듈을 직접 import해 사용한다.

**Rationale**: spec FR-018이 "비동기 로딩 상태 처리는 범위 밖"이라고 명시했다. 003 대시보드(`src/mocks/dashboard.mock.ts`)는 로딩 스켈레톤이 요구사항이라 인위적 `delay()`를 넣었지만, 006은 그 요구사항 자체가 없으므로 같은 패턴을 따를 이유가 없다(불필요한 복잡도).

**Alternatives considered**: 003과 동일하게 `delay()` + 로딩 상태 추가 — spec 범위 밖 기능을 임의로 추가하는 것이라 CLAUDE.md "스펙에 없는 기능 임의 추가 금지"에 위반 → 기각.
