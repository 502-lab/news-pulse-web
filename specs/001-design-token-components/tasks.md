---
description: "Task list — 001 디자인 토큰 & 공유 UI 컴포넌트 시스템"
---

# Tasks: 디자인 토큰 & 공유 UI 컴포넌트 시스템

**Input**: Design documents from `specs/001-design-token-components/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Tests**: 명시적 요청 없음 — 테스트 태스크 미포함. quickstart.md의 수동 검증 시나리오로 대체.

**Organization**: 유저 스토리 우선순위(P1 → P2) 순서로 Phase 구성. 각 Phase는 독립 검증 가능.

---

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: 동시 실행 가능 (다른 파일, 미완료 의존 없음)
- **[US1~US4]**: 유저 스토리 매핑 (spec.md 기준)
- 각 태스크에 정확한 파일 경로 포함

---

## Phase 1: Setup (패키지 & 환경)

**Purpose**: 첫 번째 코드 작성 전 완료되어야 하는 외부 의존성 설치.

- [x] T001 lucide-react 설치(`pnpm add lucide-react`) 및 `index.html`에 Pretendard CDN 링크 추가(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />`)

**Checkpoint**: `node_modules/lucide-react` 존재 확인, `pnpm build` 에러 없음.

---

## Phase 2: Foundational (블로킹 전제 조건)

**Purpose**: 모든 유저 스토리 구현 전 반드시 완료되어야 하는 공통 인프라.

**⚠️ CRITICAL**: 이 Phase 완료 전 Phase 3+ 작업 시작 불가.

- [x] T002 [P] `src/index.css`에 Tailwind v4 `@import "tailwindcss"` + `@theme {}` 블록으로 색상(`brand`/`navy`/`canvas`/`ink.*`/`ok`/`warn`/`danger`), `--radius-card/btn`, `--shadow-card/cardhover/pop`, `--font-sans/display` 토큰 등록 (Tailwind v4 — tailwind.config.js 불필요)
- [x] T003 [P] `src/index.css`에 `.tnum`, `.clamp2`, `.clamp3`(독립 전체 선언), `.fadeup`, `.skel`(shimmer), `.stripes`, `@keyframes fadeup`/`shimmer` 정의
- [x] T004 [P] `src/constants/categories.ts` 생성 — `CAT_COLOR` (기술/경제/정치/스포츠/문화 5종 fg/bg/dot), `CAT_FALLBACK` export
- [x] T005 [P] `src/types/news.ts` 생성 — `NewsItem` interface (id/title/source/cat/bias/time/reads/summary?/content?), `StatCardData` interface (label/sub/value/delta/fmt/icon/tone) export

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음, `pnpm build` 에러 없음.

---

## Phase 3: User Story 1 — 일관된 토큰 기반 컴포넌트 (Priority: P1) 🎯 MVP

**Goal**: 토큰만 사용해 새 UI를 조합할 수 있는 최소 컴포넌트 세트 제공.

- [x] T006 [US1] `src/components/ui/Card.tsx` 생성 — `CardProps`(children/className/pad?=true/hover?=false) + `CardHeadProps`(title/sub?/right?) 두 컴포넌트 export
- [x] T007 [P] [US1] `src/components/ui/Segmented.tsx` 생성 — `SegmentedOption = string | {v: string; label: string}`

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음.

---

## Phase 4: User Story 4 — Icon 시스템 (Priority: P2)

**Goal**: 44개 아이콘을 `name` prop 하나로 렌더링.

- [x] T008 [US4] `src/components/ui/Icon.tsx` 생성 — 41개 lucide 매핑 + 3개 커스텀 SVG path + 미지원 name → `<span />`

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음.

---

## Phase 5: User Story 2 — 데이터 상태 처리 컴포넌트 (Priority: P1)

**Goal**: loading/정상/빈 상태 세 가지를 각각 시각화하는 컴포넌트 3종.

- [x] T009 [P] [US2] `src/components/ui/StatCard.tsx` 생성
- [x] T010 [P] [US2] `src/components/ui/EmptyState.tsx` 생성
- [x] T011 [P] [US2] `src/components/ui/StatusDot.tsx` 생성

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음.

---

## Phase 6: User Story 3 — NewsCard 기사 렌더링 (Priority: P2)

**Goal**: `NewsItem` 하나로 완성된 기사 카드를 렌더링.

- [x] T012 [P] [US3] `src/components/ui/CatBadge.tsx` 생성
- [x] T013 [P] [US3] `src/components/ui/BiasChip.tsx` 생성
- [x] T014 [P] [US3] `src/components/ui/ImgPlaceholder.tsx` 생성
- [x] T015 [US3] `src/components/ui/NewsCard.tsx` 생성

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음.

---

## Phase 7: Polish — Barrel Export

**Purpose**: 모든 컴포넌트를 단일 import path로 제공.

- [x] T016 `src/components/ui/index.ts` 생성 — 10개 컴포넌트 barrel export

**Checkpoint**: `import { Card, Icon, StatCard } from '@/components/ui'` TypeScript 에러 없음. `pnpm build` 에러 없음.

---

## 의존성 그래프

```
T001 (Setup)
  └─► T002, T003, T004, T005 (Foundational, 병렬)
        └─► T006 (Card/CardHead — depends: T002, T003)
            T007 (Segmented — depends: T002, T003) [병렬 with T006]
              └─► T008 (Icon — depends: T001)
                    └─► T009 (StatCard — depends: T002, T004, T005, T006, T008) [병렬]
                        T010 (EmptyState — depends: T002, T003, T008)          [병렬]
                        T011 (StatusDot — depends: T002, T003)                 [병렬]
                          └─► T012 (CatBadge — depends: T002, T003, T004) [병렬]
                              T013 (BiasChip — depends: T002, T003)        [병렬]
                              T014 (ImgPlaceholder — depends: T003)        [병렬]
                                └─► T015 (NewsCard — depends: T006,T008,T012,T013,T014)
                                      └─► T016 (Barrel Export — depends: T006~T015 전체)
```

## Rollback 기준

- T001 실패: `pnpm remove lucide-react`, index.html CDN 링크 제거 후 재시도
- T002~T016 실패: 해당 파일 삭제 후 재시도. 다른 태스크에 영향 없음
