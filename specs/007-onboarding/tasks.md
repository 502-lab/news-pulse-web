# Tasks: 007 온보딩 (W-12)

**Input**: `specs/007-onboarding/` — spec.md · plan.md · research.md · data-model.md · contracts/component-contracts.md

**Branch**: `007-onboarding`

**User Stories**: US-1(P1) US-2(P1) US-3(P2) US-4(P1) US-5(P2) US-6(P2)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 다른 파일, 병렬 실행 가능
- **[Story]**: 해당 태스크의 사용자 시나리오

---

## Phase 1: Setup

**Purpose**: 신규 디렉토리 생성 — 브랜치·프로젝트 설정은 이미 완료

- [x] T001 Create `src/components/features/onboarding/` directory for step components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 US 구현 전 완료 필수 — 상수 · 컨트롤러 훅 · 타입 수정

**⚠️ CRITICAL**: 이 단계 완료 전 US 구현 시작 금지

- [x] T002 Fix `submitOnboarding()` return type from `Promise<OnboardingStatusResponse>` to `Promise<void>` in `src/lib/api/auth.ts` (research.md R-06 — `POST /api/v1/me/onboarding`은 `ApiResponseVoid` 반환)

- [x] T003 [P] Create `src/constants/onboarding.ts` with all `ONB_*` constants and enum mappings: `ONB_AGES` (4종 · TEENS 제외), `ONB_JOBS` (7종 디자인 기준), `ONB_TOPICS` (8종 · cat/label/icon/color), `ONB_KW_GROUPS` (3그룹 · type: COMPANY/THEME/PERSON), `ONB_DEPTHS` (3종 · BRIEF/BALANCED/DEEP), `ONB_MODES` (3종 · READ/LISTEN/BOTH), `ONB_TIMES` (3종 · HH:mm), `ONB_VOICES` (2종 · harin/junseo), `ONB_STEPS` (5종), `ONB_HEADS` (단계별 제목/설명 tuple), `AGE_TO_ENUM` mapping (data-model.md §4)

- [x] T004 Create `src/hooks/useOnboarding.ts` — `OnboardingFormState` interface, `OnboardingAction` union (14 actions), `INITIAL_STATE` (depth: 'BALANCED', consumeMode: 'READ', briefingTime: '07:30', pushAgreed: true), `onboardingReducer`, `getCanProceed` (step 1: `nick.trim().length > 0`; step 2: `topics.length >= 3`; others: true), `buildPayload` (voiceId 제외, `voiceEnabled: voice !== null`, `timezoneOffset: new Date().getTimezoneOffset() * -1`), `useOnboarding` hook export with `{ state, dispatch, canProceed, next, back, skip, submit }` (data-model.md §1~3, contracts/component-contracts.md §useOnboarding)

- [x] T005 [P] Verify `src/components/guards/GateRoute.tsx` has `!user.onboardingCompleted → <Navigate to="/onboarding" replace />` guard — read-only check; document pass/fail in inline comment (research.md R-01, FR-016)

**Checkpoint**: T002~T005 완료 후 US 구현 시작 가능

---

## Phase 3: US-1 (P1) — 신규 사용자 온보딩 완주 🎯 MVP

**Goal**: 5단계 멀티스텝 카드 렌더 + 전체 진행 + API 저장 + `/home` 이동

**Independent Test**: 1~5단계 모두 입력 → "Newsift 시작하기" → `POST /api/v1/me/onboarding` 성공 → `/home` 이동

### Implementation

- [x] T006 [US1] Create `src/components/features/onboarding/OnbRail.tsx` — navy 좌측 레일 `w-[260px] bg-navy text-white flex flex-col p-7`, 5단계 세로 목록(완료: brand bg + check icon / 현재: white / 대기: white/10 반투명), 브랜드마크, 부제 "맞춤 설정 · 1분이면 끝나요", 하단 "모든 설정은 가입 후 언제든 바꿀 수 있어요." (contracts/component-contracts.md §OnbRail, FR-001, FR-002)

- [x] T007 [P] [US1] Create `src/components/features/onboarding/OnbStep1Profile.tsx` — 닉네임 `<input id="onb-nick" maxLength={12}>` + `<label htmlFor="onb-nick">` + 글자수 카운터 `{nick.length} / 12`; 연령대 4종 `aria-pressed` 토글(재선택 시 deselect); 직업 7종 `aria-pressed` 태그 토글(재선택 deselect); `ONB_AGES` / `ONB_JOBS` 상수 사용 (contracts §OnbStep1Profile, FR-005, FR-022, FR-023)

- [x] T008 [P] [US1] Create `src/components/features/onboarding/OnbStep2Topics.tsx` — 토픽 8종 `grid grid-cols-2 sm:grid-cols-4 gap-3`, 각 카드 `relative h-28 rounded-card border`; 선택 시 `bg-brand border-brand shadow-cardhover`; 미선택 아이콘 배경 `style={{ background: t.color + '1A' }}` (인라인 style 허용 — 동적 hex+투명도); 선택 시 우상단 체크 배지; `aria-pressed`; `ONB_TOPICS` 상수 사용 (contracts §OnbStep2Topics, FR-006, plan Constraints 인라인 예외)

- [x] T009 [P] [US1] Create `src/components/features/onboarding/OnbStep3Keywords.tsx` — `ONB_KW_GROUPS` 3그룹 헤더 + 태그 토글; 선택 `bg-brand text-white`, 미선택 `bg-white border-ink-200`; 선택 태그 check icon prefix; `aria-pressed` (contracts §OnbStep3Keywords, FR-007)

- [x] T010 [P] [US1] Create `src/components/features/onboarding/OnbStep4Reading.tsx` — `ONB_DEPTHS` 3종 라디오 카드 `flex items-center gap-3 px-4 py-3.5 rounded-card border`; `ONB_MODES` 3종 아이콘+텍스트 카드 `grid-cols-3 gap-3`; 각 선택 `bg-brand-50 border-brand`; `aria-pressed` (contracts §OnbStep4Reading, FR-008)

- [x] T011 [P] [US1] Create `src/components/features/onboarding/OnbStep5Briefing.tsx` — 시간 3종(`ONB_TIMES`) `grid-cols-3`; 음성 2종(`ONB_VOICES`) 각 행: 아바타 원(`style={{ background: v.color }}` 인라인 허용) + 이름/설명 + `<button disabled aria-label="앱에서 미리듣기 가능">` + 라디오; 하단 "🎧 앱에서 목소리를 미리 들어보세요"; 앱 설치 `<button disabled>앱 다운로드</button>`; 푸시 토글 `role="switch" aria-checked={pushAgreed}` (contracts §OnbStep5Briefing, FR-009, FR-013, FR-014)

- [x] T012 [US1] Rewrite `src/pages/onboarding/OnboardingPage.tsx` — (a) 재진입 가드: `if (user?.onboardingCompleted) return <Navigate to="/home" replace />;`; (b) `useOnboarding()` 훅 연결; (c) OnboardingDesktop 레이아웃: `min-h-screen bg-canvas flex items-center justify-center p-6` wrapper, `w-full max-w-[940px] bg-white border border-ink-200 rounded-2xl shadow-pop overflow-hidden flex` 카드, `style={{ height: 'min(680px, 92vh)' }}` (인라인 허용); (d) `<OnbRail currentStep={state.step} />`; (e) 우측 `flex-1 flex flex-col`: 스크롤 영역 `flex-1 overflow-y-auto px-9 py-8`(STEP n/5 + 단계 헤드 `ONB_HEADS[state.step]` + 에러 표시 + OnbStep switch); (f) footer `border-t border-ink-100 px-9 py-4 flex items-center justify-between`: 이전(`disabled={state.step === 1}`) + step 2 카운터 + 다음/시작(`disabled={!canProceed || state.submitStatus === 'loading'}`); (g) 성공 핸들러: `setAuth({ ...user, onboardingCompleted: true }, accessToken)` + `navigate('/home', { replace: true })` (FR-001~004, FR-012, FR-015~021, contracts §OnboardingPage, plan layout 설계)

**Checkpoint**: 5단계 완주 + `/home` 이동 동작 확인

---

## Phase 4: US-2 (P1) — 2단계 관심사 최소 선택 강제

**Goal**: 토픽 3개 미만 → "다음" 비활성, 선택 카운터 실시간 표시

**Independent Test**: 2단계에서 토픽 2개 선택 → "다음" disabled. 3번째 선택 → 활성.

### Implementation

- [x] T013 [US2] In `src/pages/onboarding/OnboardingPage.tsx` footer: confirm step-2 selection counter `{state.topics.length}개 선택됨` renders when `state.step === 2`; confirm `disabled={!canProceed || state.submitStatus === 'loading'}` on "다음" button covers step 2 via `getCanProceed` (`topics.length >= 3`) — adjust if missing (FR-010, SC-002)

**Checkpoint**: 토픽 2개 → disabled, 3개 → 활성 동작 확인

---

## Phase 5: US-4 (P1) — 완료 사용자 재진입 방지

**Goal**: `onboardingCompleted: true` 사용자 `/onboarding` 진입 시 즉시 `/home` 리다이렉트 (렌더 플래시 없음)

**Independent Test**: 온보딩 완료 계정으로 `/onboarding` URL 직접 입력 → `/home` 리다이렉트

### Implementation

- [x] T014 [US4] Verify `src/components/guards/GateRoute.tsx` redirects `onboardingCompleted: true` users from `/onboarding` to `/home` — distinct from T005 (T005: incomplete → /onboarding; T014: complete → /home); add `if (user.onboardingCompleted && location.pathname === '/onboarding') return <Navigate to="/home" replace />;` if missing (research.md R-01, FR-016, SC-004)

- [x] T015 [US4] Confirm `src/pages/onboarding/OnboardingPage.tsx` reentry guard (from T012) triggers before any render — `if (user?.onboardingCompleted) return <Navigate to="/home" replace />;` at top of component body (contracts §OnboardingPage, SC-004 flash prevention)

**Checkpoint**: 완료 계정 재진입 → 플래시 없이 /home 확인

---

## Phase 6: US-3 (P2) — 선택 단계 건너뛰기

**Goal**: 3·4단계 "건너뛰기" 버튼 제공, 1·2·5단계는 없음

**Independent Test**: 3단계 건너뛰기 → 4단계, 4단계 건너뛰기 → 5단계, 키워드 미선택

### Implementation

- [ ] T016 [US3] In `src/pages/onboarding/OnboardingPage.tsx` footer: add "건너뛰기" button rendered only when `state.step === 3 || state.step === 4`, calls `skip()` from `useOnboarding` (`SKIP` action → step+1); place between "이전" and "다음" (FR-011, spec US-3 acceptance scenarios)

**Checkpoint**: 3/4단계 건너뛰기 동작, 1/2/5단계 버튼 없음 확인

---

## Phase 7: US-5 (P2) — API 저장 실패 재시도

**Goal**: 저장 실패 → 에러 메시지 표시 + 버튼 재활성 + 재시도 허용

**Independent Test**: DevTools Network에서 `POST /api/v1/me/onboarding` 차단 → 에러 표시 + 버튼 활성. 차단 해제 후 재클릭 → 성공

### Implementation

- [ ] T017 [US5] In `src/pages/onboarding/OnboardingPage.tsx` right-panel content area: render `state.submitError` message when `state.submitStatus === 'error'` (e.g. `<p role="alert" className="text-danger text-sm">{state.submitError}</p>`); confirm "Newsift 시작하기" button re-enables (`submitStatus !== 'loading'`) after error — `useOnboarding` `SUBMIT_ERROR` action already resets status to 'error' (not 'loading') (FR-019, SC-005)

**Checkpoint**: API 차단 → 에러 + 재시도 가능 확인 (quickstart.md S-4)

---

## Phase 8: US-6 (P2) — 5단계 음성 웹 전용 처리

**Goal**: 재생 버튼 disabled + 안내 문구, 앱 설치 버튼 no-op

**Independent Test**: 5단계에서 재생 버튼·앱 설치 버튼 클릭 불가 확인

### Implementation

- [ ] T018 [US6] Verify `src/components/features/onboarding/OnbStep5Briefing.tsx` (created in T011): play button has `disabled` attr + `aria-label="앱에서 미리듣기 가능"`, "🎧 앱에서 목소리를 미리 들어보세요" text visible, app install button has `disabled` and no click handler — adjust if missing (FR-013, FR-014, spec US-6)

**Checkpoint**: 재생/앱 버튼 비활성 + 안내 문구 표시 확인

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 접근성 · 이중제출 방지 · 타입 검증 · 디자인 정확도

- [ ] T019 [P] Audit `aria-pressed` on all toggle buttons across OnbStep1~5 components — ages/jobs (OnbStep1), topics (OnbStep2), keywords (OnbStep3), depth/mode (OnbStep4), time/voice (OnbStep5) — verify `aria-pressed={isSelected}` present and accurate (FR-022)

- [ ] T020 [P] Audit `<label htmlFor="onb-nick">닉네임</label>` with required indicator in `src/components/features/onboarding/OnbStep1Profile.tsx` — label must be visually connected (FR-023)

- [ ] T021 Verify double-submit prevention in `src/pages/onboarding/OnboardingPage.tsx` — "Newsift 시작하기" button `disabled={submitStatus === 'loading'}` prevents second call; confirm `useOnboarding.submit()` early-returns if `state.submitStatus === 'loading'` (FR-018, edge case)

- [ ] T022 Run `pnpm type-check` (or `pnpm build --noEmit`) and fix TypeScript errors in all new/modified files — `src/lib/api/auth.ts`, `src/constants/onboarding.ts`, `src/hooks/useOnboarding.ts`, `src/pages/onboarding/OnboardingPage.tsx`, all OnbStep components

- [ ] T023 [P] Visual review against `OnboardingDesktop` design — verify: `max-w-[940px]` card, `w-[260px]` navy rail, `shadow-pop`, `rounded-2xl`, `height: min(680px, 92vh)`, step rail state colors (brand/white/white/10), footer layout — no raw hex/px outside plan Constraints (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: 즉시 시작 가능
- **Phase 2 Foundational**: Phase 1 완료 후 — 이후 모든 US 블로킹
- **Phase 3 US-1**: Phase 2 완료 필수 — T006~T011 병렬 가능, T012는 T006~T011 완료 후
- **Phase 4 US-2**: T012(US-1) 완료 후 — 주로 OnboardingPage 확인/보완
- **Phase 5 US-4**: Phase 2 완료 후 — Phase 3과 병렬 가능
- **Phase 6 US-3**: T012 완료 후 (OnboardingPage footer 수정)
- **Phase 7 US-5**: T012 완료 후 (submitError 표시 추가)
- **Phase 8 US-6**: T011 완료 후 (OnbStep5 검증)
- **Phase 9 Polish**: 모든 Phase 3~8 완료 후

### User Story Dependencies

- **US-1 (P1)**: Foundational 완료 후 → MVP 핵심
- **US-2 (P1)**: US-1 T012 완료 후 → 카운터·버튼 확인
- **US-4 (P1)**: Foundational 완료 후 → US-1과 병렬 가능
- **US-3 (P2)**: US-1 T012 완료 후
- **US-5 (P2)**: US-1 T012 완료 후
- **US-6 (P2)**: US-1 T011 완료 후

### Parallel Opportunities (Phase 3 US-1)

```
# T006~T011 병렬 실행 가능 (각자 독립 파일):
OnbRail.tsx · OnbStep1Profile.tsx · OnbStep2Topics.tsx
OnbStep3Keywords.tsx · OnbStep4Reading.tsx · OnbStep5Briefing.tsx

# T012는 T006~T011 모두 완료 후:
OnboardingPage.tsx (모든 step 컴포넌트 import)
```

---

## Implementation Strategy

### MVP (P1 스토리만)

1. Phase 1: Setup
2. Phase 2: Foundational (T002~T005)
3. Phase 3: US-1 — T006~T011 병렬 + T012 (핵심 5단계 셸)
4. Phase 4: US-2 — T013 (토픽 카운터·버튼 확인)
5. Phase 5: US-4 — T014~T015 (재진입 방지)
6. **STOP & VALIDATE**: quickstart.md S-1, S-2, S-3 실행
7. P2 스토리(US-3, 5, 6) + Polish 추가

### Incremental Delivery

- US-1 완료 → 5단계 완주 가능 (기본 동작)
- US-2 추가 → 토픽 최소 선택 강제
- US-4 추가 → 재진입 방지
- US-3 추가 → 건너뛰기 허용
- US-5 추가 → 실패 복구
- US-6 추가 → 음성 웹 처리
- Polish → 접근성 + 디자인 정확도 완성

---

## Notes

- [P] = 다른 파일, 의존성 없음, 병렬 가능
- US-1 T006~T011 병렬 실행 권장 (각자 독립 컴포넌트)
- 기존 자산 재사용: `submitOnboarding()`(auth.ts:155), `GateRoute`, `AuthUser.onboardingCompleted` — 새로 만들지 말 것
- voiceId 전송 금지, voiceEnabled: boolean만 (research.md R-03)
- 인라인 style 3건 허용 (plan Constraints): 카드 높이 / 토픽 아이콘 배경 / 음성 아바타 배경
- 범위 밖: TTS 재생 / 앱 버튼 연결 / 닉네임 중복검사 / 중간 저장 / voiceId 전송
