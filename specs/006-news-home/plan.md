# Implementation Plan: 006 뉴스 홈 (W-U-01)

**Branch**: `006-news-home` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-news-home/spec.md`

## Summary

USER가 `/home`(기존 `UserGnbLayout` 하위, 현재 placeholder)에 진입했을 때 보이는 메인 화면을 W-U-01 참조 디자인(`Newsift_screens/screen-newshome.jsx`, `user-01-home-WU01.html`)과 일치하도록 구현한다. 핵심 속보 배너 + 카테고리 필터 + AI 요약 포함 뉴스 카드 그리드(좌, 8/12)와 인기 키워드·속보 타임라인·AI 브리핑 위젯 패널(우, 4/12)로 구성하며, 모든 데이터는 목데이터다. 신규 코드는 화면 전용 조합 컴포넌트(`src/components/features/news/*`)로 작성하고 내부적으로 기존 `src/components/ui/*` 프리미티브를 재사용한다. 북마크는 비영속 in-memory `useState`로 구현(토글+토스트 피드백만, 새로고침 시 초기화)하며, 영속 저장과 구현 도구 선택은 후속 단계로 이관한다. `/search` 라우트는 빈 스텁으로만 등록하고 실제 검색 결과 구현은 후속 단계로 이관한다.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Vite 6

**Primary Dependencies**:
- React Router v7 — `/home` 기존 라우트 재사용, 키워드 결과용 `/search` 라우트 신규 추가 (already installed)
- Zustand — 이번 기능 범위에서 북마크에 사용하지 않음(신규 의존성 도입 회피, 비영속 in-memory `useState` 채택)
- Tailwind CSS v4 (CSS-first, `@theme` in `src/index.css`) — 스타일 (already installed)
- Vitest + React Testing Library — 테스트 (already installed)
- TanStack Query — 본 기능 범위에서는 사용하지 않음(목데이터 동기 호출, 비동기 로딩 상태가 범위 밖이라 서버 상태 관리 라이브러리가 불필요)

**Storage**:
- 북마크 상태: in-memory(`useState<Set<string>>` in `HomePage`), 새로고침 시 초기화 — 영속 저장(localStorage/서버)은 후속 단계로 이관
- 그 외 모든 데이터(기사·키워드·AI 브리핑): 빌드에 포함되는 정적 목데이터 모듈(`src/mocks/newsHome.mock.ts`), 영속 없음

**Testing**: Vitest + React Testing Library (`src/__tests__/homePage.test.tsx` 신규)

**Target Platform**: Chrome / Safari / Firefox 최신 2버전, SPA, 데스크톱·태블릿·모바일 반응형(웹 전용 화면)

**Project Type**: Web application (React SPA, frontend-only)

**Performance Goals**:
- SC-002: 카테고리 필터 전환 1초 이내 반영 — 목데이터 클라이언트 필터링(`useMemo`)이므로 사실상 즉시 반영

**Constraints**:
- `any` 타입 금지
- 인라인 style 금지 — **단 1건 예외**: 인기 키워드 위젯의 진행률 바 `width`(연속적 데이터 값, 디자인 토큰으로 표현 불가)에 한해 `style={{ width: ... }}` 허용. 색상·간격·라운드 등 다른 모든 속성은 Tailwind 토큰 사용 (근거: research.md R-04)
- 폼 라이브러리 없음 — 본 기능에 폼 없음(필터·토글만 존재)
- FR-017: 화면을 위한 신규 범용 UI 컴포넌트 금지(`src/components/ui/*`에 추가 금지). 화면 전용 조합 컴포넌트는 `src/components/features/news/*`에 신규 작성 허용
- FR-018: 비동기 로딩 상태 처리 범위 밖 — 목데이터는 동기 import로 제공(003 대시보드의 인위적 delay 패턴을 따르지 않음)

**Scale/Scope**: 1 페이지(`HomePage` 재구현) + 1 보조 페이지(`SearchResultsPage` 빈 스텁 신규) + 화면 전용 컴포넌트 6종 + 목데이터 모듈 1종

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 평가 | 비고 |
|---|---|---|
| I. Strict Architecture Boundary | ✅ 통과 | 백엔드 호출 없음(전부 목데이터), 백엔드 동작에 대한 가정 없음 |
| II. API Contract First | ✅ 통과 (N/A) | 이번 기능은 API 호출이 없어 OpenAPI 스펙과 무관 |
| III. Complete State Handling | ⚠️ 일부 면제 (정당화됨) | Loading 상태는 FR-018에 따라 범위 밖(동기 목데이터라 로딩 자체가 없음). Error 상태도 동일 이유로 없음. Empty 상태는 카테고리 필터 결과 0건 시 `EmptyState`로 적용(FR-004) — 완전 면제가 아니라 "해당 안 되는 상태만 생략" |
| IV. Type Safety | ✅ 통과 | `any` 미사용, `@/types/news.ts`의 `NewsItem` 재사용 + 신규 타입은 명시적 interface로 정의 |
| V. Accessibility by Default | ✅ 통과 (강화) | 참조 프로토타입의 버튼-안-버튼 마크업을 의도적으로 깨고 stretched-link 패턴으로 재구성(research.md R-05) |
| Component Design (100줄) | ✅ 통과 목표 | 위젯·배너·필터·카드를 책임별로 분리해 각 컴포넌트 100줄 이하 유지 |
| Styling (Tailwind only) | ⚠️ 1건 예외 정당화 | 위 Constraints의 인라인 style 예외(R-04) — 디자인 토큰으로 표현 불가능한 연속값(progress bar width)에 한정 |
| Third-Party Library 기준 | ✅ 통과 (N/A) | 신규 라이브러리 추가 없음(Zustand·Tailwind 기존 스택만 사용) |

## Project Structure

### Documentation (this feature)

```text
specs/006-news-home/
├── plan.md                      # this file
├── research.md                  # Phase 0 output
├── data-model.md                # Phase 1 output
├── quickstart.md                # Phase 1 output
├── contracts/
│   └── component-contracts.md   # Phase 1 output — 신규 컴포넌트 props 계약 (API 계약 없음, 전부 목데이터)
└── checklists/
    └── requirements.md
```

### Source Code (신규·변경 파일)

```text
src/
├── pages/
│   └── user/
│       ├── HomePage.tsx                 ← 재구현 (placeholder → 실제 W-U-01, 북마크 in-memory useState 포함)
│       └── SearchResultsPage.tsx        ← 신규 빈 스텁 ("검색 결과 준비 중" placeholder, 실제 구현 후속)
├── components/
│   └── features/
│       └── news/                        ← 신규 디렉토리 (화면 전용 조합 컴포넌트)
│           ├── BreakingBanner.tsx        ← US1: 핵심 속보 배너
│           ├── CategoryFilter.tsx        ← US2: 카테고리 필터 탭
│           ├── NewsHomeCard.tsx          ← US2+US3: AI 요약 카드 + 북마크 (stretched-link)
│           ├── NewsHomeGrid.tsx          ← US2: auto-fill 그리드 + EmptyState 분기
│           ├── TrendingKeywordsWidget.tsx← US4: 인기 키워드 Top5
│           ├── BreakingTimelineWidget.tsx← US4: 속보 타임라인
│           └── AIBriefingWidget.tsx      ← US4: 오늘의 AI 브리핑
├── mocks/
│   └── newsHome.mock.ts                  ← 신규 (NEWS_HOME, TRENDING_KEYWORDS, AI_BRIEFING)
├── constants/
│   └── categories.ts                     ← 확장 (HOME_CATEGORY_FILTERS 추가, 기존 CAT_COLOR 재사용)
├── types/
│   └── news.ts                           ← 확장 (NewsItem에 isBreaking?: boolean 추가)
└── app/
    └── router.tsx                        ← 확장 (`/search` 빈 스텁 라우트 추가)

src/__tests__/
└── homePage.test.tsx                     ← 신규
```

**Structure Decision**: 기존 `src/components/ui/*`(NewsCard, CatBadge, EmptyState, Card, CardHead, ImgPlaceholder, Icon)를 프리미티브로 두고, 화면 전용 조합은 CLAUDE.md가 이미 예정해 둔 `src/components/features/news/` 아래에 신규 작성한다(FR-017이 허용하는 예외). 목데이터는 `src/mocks/`에, 북마크 상태는 `HomePage` 내부 `useState`(비영속)로 관리한다.

## 반응형 설계 — 카드 그리드 minWidth 및 전환폭 도출

**도출 결과**: 카드 그리드 `grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4`, 본문/위젯 스택 전환폭 `xl`(1280px, Tailwind 기본값 = CLAUDE.md "desktop ≥1280px" 그대로).

**역산 과정** (참조 디자인 HTML 실측값 기준 — `max-w-[1320px] px-8`, `grid-cols-12 gap-6`, 카드 그리드 `grid-cols-3 gap-4`):

1. 컨테이너: `max-w-[1320px] mx-auto px-8` → 콘텐츠 폭 = 1320 − 32×2 = **1256px**(컨테이너가 1320px보다 넓어도 더 늘지 않음 — "본문을 화면 끝까지 꽉 채우지 않는다" 요구사항 충족).
2. 12열 그리드(`gap-6`=24px, 11개 거터): 거터 합 264px → 열 단위 = (1256−264)/12 ≈ **82.7px**.
3. 본문(`col-span-8`) = 8×82.7 + 7×24 ≈ **829px**. 위젯(`col-span-4`) = 4×82.7 + 3×24 ≈ **403px** (829+24+403=1256 ✓).
4. 데스크톱 최소 폭(`xl`=1280px, 콘텐츠 1216px)에서도 같은 공식으로 본문 ≈ **803px** — 즉 데스크톱 구간(1280px~) 전체에서 본문 폭은 항상 803~829px 사이.
5. 본문 안 카드 그리드(`gap-4`=16px, 3열): 카드 폭 = (829−32)/3 ≈ **266px**(최댓값) ~ (803−32)/3 ≈ **257px**(데스크톱 최솟값).
6. `minmax(240px,1fr)` 선택: 240px < 257px(데스크톱 최소 카드 폭)이므로 **데스크톱 구간(≥1280px) 전체에서 항상 정확히 3열**이 유지되고(참조 디자인과 1:1 일치, SC-008), 4열은 절대 발생하지 않음(4×240+3×16=1008 > 829, 가장 넓을 때도 불가능).
7. 스택 전환폭 = **`xl`(1280px)**: CLAUDE.md가 정의한 "desktop ≥1280px / tablet 768~1279px" 경계와 동일하고, 이 프로젝트가 이미 `xl:`을 데스크톱 전용 다단 레이아웃 분기점으로 써온 관례(`DashboardPage.tsx`의 `xl:grid-cols-4`, `CommonComponentsPage.tsx`의 `hidden xl:block`)와 일치한다. 그보다 낮은 폭(예: `lg`=1024)을 쓰면 위젯 패널 폭이 본문 8:4 분할상 약 280px 밑으로 줄어 키워드 바·타임라인이 읽기 어려워진다(위젯이 "보조 정보"로 기능하려면 일정 폭이 필요).
8. **알려진 트레이드오프**: 스택 직후(`xl` 미만, 본문이 8/12 분할 폭(~803px)에서 전체 콘텐츠 폭(최대 1216px)으로 갑자기 넓어지는 구간) 카드가 일시적으로 4열까지 늘어날 수 있다(`viewport` 약 1072~1280px 구간). 이는 "더 넓어진 폭에 맞춰 더 많은 열이 들어간다"는 `auto-fill`의 정상 동작이며, 겹침·잘림·가로스크롤 등 SC-006이 금지하는 결함은 발생하지 않는다. 참조 디자인과의 픽셀 정합(SC-008)이 요구되는 구간은 데스크톱(≥1280px)뿐이라 이 구간 밖의 일시적 4열은 수용 가능한 트레이드오프로 본다(근거 상세: research.md R-01).
9. 그 아래(`gap-4`=16px 기준) 2열→1열 전환폭: 2열 하한 폭 = 2×240+16=496px(콘텐츠 폭 496px ↔ `viewport` ≈ 560px), 그 밑은 1열. 이 구간은 별도 브레이크포인트 클래스 없이 `auto-fill`이 연속적으로 처리한다.

## Deferred (후속 단계 이관)

- **북마크 영속 저장**: localStorage 클라이언트 영속 또는 서버 동기화 구현. 어떤 저장소·도구(Zustand persist, localStorage 직접, 서버 API)를 선택할지도 이 단계에서 결정한다.
- **검색 결과 페이지**: `/search?keyword=<kw>` 라우트의 실제 결과 UI — 목데이터 키워드 필터링, 결과 건수 표시, `NewsHomeGrid` 재사용 등.

## Complexity Tracking

> Constitution 원칙 위반 없음(인라인 style 1건은 위 Constraints/Constitution Check에서 범위를 한정해 정당화함). 추적 항목 없음.
