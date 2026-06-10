# Implementation Plan: 디자인 토큰 & 공유 UI 컴포넌트 시스템

**Branch**: `dev` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-design-token-components/spec.md`

---

## Summary

Newsift 대시보드 전체에서 공통으로 사용하는 디자인 토큰(Tailwind extend config)과 공유 UI 컴포넌트 10종을 구현한다. 이 단계가 완료되어야 002(레이아웃)~007(인증) 화면 구현이 시작될 수 있다.

기술 접근: lucide-react를 아이콘 기반 패키지로 도입하고, 커스텀 아이콘은 별도 상수로 관리한다. 테마는 v1에서 `classic` 단일 테마만 지원하며, 카테고리 색상은 런타임 동적 주입을 위해 JS 상수로 관리한다(Tailwind 임의값 구문 대신). 15개 태스크를 의존성 순서에 따라 순차 실행한다.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: React 18, Tailwind CSS v3, Vite 5, lucide-react (신규 추가)

**Storage**: N/A (순수 UI 컴포넌트, 상태 없음)

**Testing**: Vitest + React Testing Library (`src/__tests__/`)

**Target Platform**: Web — Chrome/Safari/Firefox 최신 2버전 (Constitution 브라우저 지원 기준)

**Project Type**: Web application (Frontend SPA), 디자인 시스템 기반 레이어

**Performance Goals**: shimmer 애니메이션 60fps, 컴포넌트 마운트 < 16ms

**Constraints**: TypeScript strict mode (`any` 금지), 모든 컴포넌트 3상태(로딩·정상·빈) 처리, 인라인 style 금지 (카테고리 동적 색상 단일 예외)

**Scale/Scope**: 공유 컴포넌트 10종 + 아이콘 44개 + 디자인 토큰 1세트 → 7개 화면 전체 공유

---

## Constitution Check

*GATE: Phase 0 research 전 통과 필수. Phase 1 design 후 재확인.*

| 원칙 | 검사 항목 | 상태 | 비고 |
|------|---------|------|------|
| §I 아키텍처 경계 | 백엔드 로직·데이터 영속성 없음 | ✅ PASS | 순수 UI 컴포넌트 |
| §II API Contract First | API 타입 사용 없음 (UI 전용) | ✅ PASS | 해당 없음 |
| §III 완전 상태 처리 | StatCard loading 스켈레톤, EmptyState 컴포넌트, CatBadge/BiasChip 폴백 정의 | ✅ PASS | 모든 컴포넌트 3상태 명시 |
| §IV 타입 안전성 | 모든 props interface 명시, any 금지, StatCardData export | ✅ PASS | |
| §V 접근성 | Icon aria-label, Segmented/NewsCard 키보드 탐색 명시 | ✅ PASS | FR-021·022 |
| §Styling 인라인 style | 카테고리 동적 색상에 한해 예외 | ⚠️ EXCEPTION | spec Assumptions에 근거 문서화 |

**Complexity Tracking** (Constitution 위반 예외 정당화):

| 위반 | 필요 이유 | 더 단순한 대안이 불가한 이유 |
|------|---------|--------------------------|
| `inline style` (카테고리 색상) | 런타임에 동적으로 결정되는 fg/bg/dot 색상 3개를 주입해야 함 | Tailwind 임의값 구문(`[#4548C9]`)은 빌드 시 purge 대상이며 런타임 동적 값 지원 불가; CSS 변수 접근법은 추가 전역 CSS 관리 복잡도 초래 |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-design-token-components/
├── plan.md          ← 이 파일
├── spec.md
├── research.md      ← Phase 0 출력
├── data-model.md    ← Phase 1 출력
├── quickstart.md    ← Phase 1 출력
├── contracts/
│   └── ui-components.md  ← Phase 1 출력
├── checklists/
│   └── requirements.md
└── tasks.md         ← /speckit-tasks 출력 (이 커맨드 미생성)
```

### Source Code (repository root)

```text
src/
├── styles/
│   └── globals.css              # 유틸리티 클래스, 키프레임
├── constants/
│   └── categories.ts            # CAT_COLOR, CAT_FALLBACK
├── types/
│   └── news.ts                  # NewsItem, StatCardData
└── components/
    └── ui/
        ├── index.ts             # Barrel export
        ├── Icon.tsx
        ├── Card.tsx             # Card + CardHead
        ├── CatBadge.tsx
        ├── BiasChip.tsx
        ├── StatCard.tsx
        ├── Segmented.tsx
        ├── StatusDot.tsx
        ├── EmptyState.tsx
        ├── NewsCard.tsx
        └── ImgPlaceholder.tsx
tailwind.config.js               # extend 토큰
index.html                       # Pretendard CDN 링크 추가
```

**Structure Decision**: Vite + React SPA 단일 프로젝트 구조 (Option 1 변형). 백엔드 없음. 소스 코드는 `src/` 하위에 역할별로 분리.

---

## Task 실행 계획

의존성 순서에 따라 15개 태스크를 순차 실행한다. 상세 구현 내용은 사용자 제공 플랜 참조.

```
001-01 패키지 설치 (lucide-react, Pretendard CDN)
001-02 Tailwind 토큰 등록
001-03 전역 CSS 유틸리티
001-04 공통 상수 & 타입 정의
  ↓
001-05 Icon           — 001-01
001-06 Card/CardHead  — 001-02
001-07 CatBadge       — 001-02, 001-03, 001-04
001-08 BiasChip       — 001-02, 001-03
001-09 ImgPlaceholder — 001-03
  ↓
001-10 StatCard       — 001-02, 001-04, 001-05, 001-06
001-11 Segmented      — 001-02, 001-03
001-12 StatusDot      — 001-02, 001-03
001-13 EmptyState     — 001-02, 001-03, 001-05
  ↓
001-14 NewsCard       — 001-05, 001-06, 001-07, 001-08, 001-09
  ↓
001-15 Barrel Export  — 전체
```
