# Implementation Plan: 007 온보딩 (W-12)

**Branch**: `007-onboarding` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-onboarding/spec.md`

---

## Spec → Plan 변경 이력

| # | 항목 | spec 내용 | plan 확정 | 근거 |
|---|---|---|---|---|
| C-1 | 닉네임 필수 | Assumption A: 빈 값 허용 | **닉네임 필수** (trim ≥ 1) | 사용자 요청으로 덮어쓰기 |
| C-2 | O-1 AuthUser | plan에서 확정 | 이미 `AccountSummaryResponse`에 존재, **타입 확장 불필요** | research.md R-02 |
| C-3 | O-2 voiceId | plan에서 확정 | **voiceId 미전송**, `voiceEnabled: boolean`만 전송 | research.md R-03 |
| C-4 | O-3 1단계 검증 | plan에서 확정 | C-1(닉네임 필수)로 대체 | |

---

## Summary

신규 구현이 아닌 **디자인 재구현(redesign)**. `OnboardingPage.tsx`·`GateRoute`·`submitOnboarding`·`AuthUser.onboardingCompleted` 전부 이미 존재. 핵심 작업:
1. `useOnboarding` 컨트롤러 훅(useReducer) 추출 — 기존 14개 inline `useState` 대체
2. `OnboardingPage.tsx` 재구현 — `OnboardingDesktop` 디자인 일치
3. 데이터 상수 수정 — 연령대(4종), 직업(7종), 5단계 음성 캐릭터 UI
4. `submitOnboarding` 반환 타입 버그 수정

---

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Vite 6

**Primary Dependencies**:
- React Router v7 — `/onboarding` 이미 등록됨
- Zustand — `useAuthStore` (onboardingCompleted 낙관적 갱신)
- Tailwind CSS v4 (CSS-first, `@theme` in `src/index.css`)
- Vitest + React Testing Library — 테스트

**Storage**:
- 온보딩 입력값: 메모리(useReducer state), 새로고침 시 초기화 (Deferred)
- 완료 여부: `AuthUser.onboardingCompleted` (서버 → 앱 부팅 시 복원)

**Testing**: Vitest + React Testing Library (`src/__tests__/onboardingPage.test.tsx` 신규)

**Target Platform**: Chrome/Safari/Firefox 최신 2버전, 데스크탑 전용(≥1280px), SPA

**Performance Goals**:
- SC-002: 토픽 선택 → "다음" 상태 전환 즉시(<100ms)
- SC-004: 재진입 가드 — 렌더 플래시 없이 `/home` 리다이렉트

**Constraints**:
- `any` 금지
- 인라인 style 예외 **1건**: 카드 높이 `min(680px, 92vh)` — CSS `min()` 함수 연속값 (R-09)
- 인라인 style 예외 **2건**: 2단계 토픽 아이콘 배경 `{color}1A` — 동적 hex 투명도 (R-04 패턴)
- 인라인 style 예외 **3건**: 음성 아바타 배경 `style={{ background: v.color }}` — 동적 색상
- 신규 범용 컴포넌트 금지 (`src/components/ui/` 추가 금지)
- FR-018 비동기 3-state: 저장 중(`submitStatus: 'loading'`) 버튼 비활성 + 로딩 텍스트

**Scale/Scope**: 1 페이지 재구현 + 1 컨트롤러 훅 + 5 단계 컴포넌트 + 1 레일 컴포넌트 + 1 상수 모듈

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 평가 | 비고 |
|---|---|---|
| I. Strict Architecture Boundary | ✅ 통과 | API 함수 `src/lib/api/auth.ts`에만, 비즈니스 로직 없음 |
| II. API Contract First | ✅ 통과 | `OnboardingRequest` 스키마 OpenAPI 확인, voiceId 갭 인지 후 처리 |
| III. Complete State Handling | ✅ 통과 | 제출 로딩/에러/성공 3-state, 에러 표면화 + 재시도 |
| IV. Type Safety | ✅ 통과 | `any` 미사용, generated types 참조, submitOnboarding 타입 수정 |
| V. Accessibility | ✅ 통과 | `aria-pressed`/`aria-checked`, `<label>` 연결, 키보드 접근 |
| Component Design (100줄) | ✅ 목표 | 5 단계 컴포넌트 분리, 각 ~80줄 이내 목표 |
| Styling | ⚠️ 3건 예외 정당화 | height min(), 토픽 아이콘 배경, 음성 아바타 색 — Constraints 명시 |

---

## Project Structure

### Documentation (this feature)

```text
specs/007-onboarding/
├── plan.md                          # this file
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/
│   └── component-contracts.md       # Phase 1 output
└── checklists/
    └── requirements.md
```

### Source Code (신규·변경 파일)

```text
src/
├── hooks/
│   └── useOnboarding.ts              ← 신규: useReducer 컨트롤러 훅
├── constants/
│   └── onboarding.ts                 ← 신규: ONB_* 상수, enum 매핑
├── pages/
│   └── onboarding/
│       └── OnboardingPage.tsx        ← 재구현: OnboardingDesktop 디자인 일치
├── components/
│   └── features/
│       └── onboarding/               ← 신규 디렉토리
│           ├── OnbRail.tsx           ← 좌측 단계 레일 (nav 배경)
│           ├── OnbStep1Profile.tsx   ← 1단계: 닉네임·연령대·직업
│           ├── OnbStep2Topics.tsx    ← 2단계: 관심 토픽 2×4 그리드
│           ├── OnbStep3Keywords.tsx  ← 3단계: 그룹별 키워드 태그
│           ├── OnbStep4Reading.tsx   ← 4단계: 요약 깊이·소비 모드
│           └── OnbStep5Briefing.tsx  ← 5단계: 시간·음성 캐릭터·푸시
└── lib/
    └── api/
        └── auth.ts                   ← 변경: submitOnboarding 반환타입 → Promise<void>

src/__tests__/
└── onboardingPage.test.tsx           ← 신규
```

---

## 레이아웃 설계 (`OnboardingDesktop` 실측)

- 컨테이너: `min-h-screen bg-canvas flex items-center justify-center p-6`
- 카드: `w-full max-w-[940px] bg-white border border-ink-200 rounded-2xl shadow-pop overflow-hidden flex`
- 카드 높이: `style={{ height: 'min(680px, 92vh)' }}` (인라인 예외)
- 좌측 레일: `w-[260px] shrink-0 bg-navy text-white flex flex-col p-7`
- 우측 콘텐츠: `flex-1 min-w-0 flex flex-col`
- 콘텐츠 스크롤: `flex-1 overflow-y-auto px-9 py-8`
- 푸터: `border-t border-ink-100 px-9 py-4 flex items-center justify-between gap-4 bg-white`

---

## Deferred (후속 단계 이관)

- 온보딩 입력값 중간 저장 (새로고침 복원)
- 음성 캐릭터 ID(`voiceId`) 서버 저장 (백엔드 필드 추가 대기)
- 앱 설치 버튼 실제 스토어/딥링크 연결
- 닉네임 중복 검사

---

## Complexity Tracking

> Constitution 원칙 위반 없음. 인라인 style 3건은 위 Constraints에서 범위를 한정해 정당화함.

| 항목 | 원칙 | 상태 | 정당화 |
|---|---|---|---|
| 인라인 style: 카드 높이 | Styling | 허용 | CSS `min()` 연속값, Tailwind arbitrary 불확실 |
| 인라인 style: 토픽 아이콘 배경 | Styling | 허용 | 동적 hex+투명도, Tailwind 토큰 표현 불가 |
| 인라인 style: 음성 아바타 배경 | Styling | 허용 | 동적 색상, 동일 근거 |
