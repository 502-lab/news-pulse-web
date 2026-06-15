# Tasks: 005 인증 화면

**Input**: Design documents from `specs/005-auth-screens/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Organization**: User Story 단위로 그룹화. 각 Story는 독립적으로 구현·검증 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 다른 파일 작업이며 의존성 없음 — 병렬 실행 가능
- **[Story]**: 해당 작업이 속한 User Story (US1~US7)
- 설명에 정확한 파일 경로 포함

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 모든 User Story가 공유하는 에러 메시지·약관 API 레이어 구축.

- [X] T001 [P] Create `src/lib/api/errorMessages.ts` — `AUTH_ERROR_MESSAGES: Record<number, string>` (401: "이메일 또는 비밀번호가 올바르지 않습니다.", 409: "이미 사용 중인 이메일입니다.", 422: "입력한 정보를 다시 확인해주세요.", 429: "잠시 후 다시 시도해주세요.", 500: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."), `NETWORK_ERROR_MESSAGE` 상수, `getAuthErrorMessage(status?: number): string` 함수
- [X] T002 [P] Create `src/lib/api/terms.ts` — `getActiveTerms()` (GET /api/v1/terms, staleTime 10분), `getConsents()` (GET /api/v1/me/consents, staleTime 0), `submitConsents(consents: ConsentInput[])` (POST /api/v1/me/consents). TanStack Query key 상수: `['terms', 'active']`, `['me', 'consents']`

**Checkpoint**: 에러 메시지·약관 API 레이어 완료 → Foundational 진행

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: US2·US3·US6 세 Story가 공유하는 약관 동의 UI 컴포넌트 구축. 이 Phase 완료 전까지 US2·US3·US6 구현 불가.

**⚠️ CRITICAL**: T003 완료 전 US2·US3·US6 불가

- [X] T003 Create `src/components/features/auth/ConsentList.tsx` — props: `{ terms: TermsVersion[], onChange: (consents: ConsentInput[], ageConfirmed: boolean) => void, disabled?: boolean }`. 서비스[필수]·개인정보[필수]·마케팅[선택]·만 14세[필수 고정 클라이언트 항목] 체크박스 렌더. "모두 동의" 체크박스(필수+선택 전체 토글, 개별 해제 시 연동 해제). `ageConfirmed`는 서버 약관과 별개 boolean 상태. `aria-label`·keyboard 탐색 필수.

**Checkpoint**: ConsentList 완료 → US2·US3·US6 구현 가능

---

## Phase 3: User Story 1 — 이메일 로그인 (Priority: P1) 🎯 MVP

**Goal**: 이메일·비밀번호 로그인 후 returnTo 복귀. 소셜 버튼 stub 포함.

**Independent Test**: `pnpm dev` → `/login` 접근, MSW 200 응답으로 `/home` 이동 확인. MSW 401로 오류 메시지 확인. returnTo 있을 때 해당 경로 복귀 확인.

- [X] T004 [P] [US1] Implement `LoginForm` in `src/components/features/auth/LoginForm.tsx` — 이메일/비밀번호 `useState` 폼(onChange 핸들러 방식). blur 시 해당 필드 검증, submit 시 전체 검증(이메일 형식·빈 입력). `login()` 호출 → `setAuth()` → `navigate(returnTo || roleHome, { replace: true })`. 제출 중 버튼 비활성(중복 방지). `getAuthErrorMessage()` 오류 표시. `<label htmlFor>`, `aria-invalid`, `aria-describedby` 포함.
- [X] T005 [P] [US1] Create `SocialButtons` stub in `src/components/features/auth/SocialButtons.tsx` — props: `{ disabled?: boolean }`. 카카오·Google·Apple 버튼 렌더, 현 Phase에서는 전체 `disabled`. US3 Phase에서 카카오·Google 활성화 예정 주석 포함. `// TODO: US3 Phase에서 getSocialAuthorizeUrl() 연결`.
- [X] T006 [US1] Implement `LoginPage` in `src/pages/auth/LoginPage.tsx` — `useLocation().state?.returnTo` 읽기. `LoginForm` + `SocialButtons` + 묵시 약관 문구("로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다" — 정보용, 체크박스 없음) + "회원가입" 링크(`/register`) + "비밀번호 찾기" 링크(`/forgot-password`). loading/error 상태 처리.

**Checkpoint**: `/login` 완전 동작, returnTo 복귀·오류 메시지 확인 후 US2 진행

---

## Phase 4: User Story 2 — 이메일 회원가입 (Priority: P1)

**Goal**: 이메일·비밀번호·약관 동의 → 가입 → `/verify-email` 이동.

**Independent Test**: MSW 201로 가입 성공 + `/verify-email` 이동. MSW 409로 "이미 사용 중인 이메일" 필드 오류. 만 14세 미동의 시 제출 차단 확인.

- [X] T007 [US2] Add `signup(body: SignupRequest)` to `src/lib/api/auth.ts` — `POST /api/v1/auth/signup` → 201 `{ account: AccountSummary, tokens: TokenPair }`. 409(이메일 중복)·422(비밀번호 규칙·약관 미동의) 에러 pass-through.
- [X] T008 [US2] Implement `RegisterForm` in `src/components/features/auth/RegisterForm.tsx` — 이메일/비밀번호/비밀번호확인 `useState` 폼 + `ConsentList` (Phase 1 T002 `getActiveTerms()` useQuery로 약관 목록 로드, 로딩 시 스켈레톤). 클라이언트 검증: 이메일 형식·비밀번호 8자+영문+숫자·비밀번호 일치·필수 약관 전체 동의·만 14세 확인. submit → `signup()` → `setAuth()` → `navigate('/verify-email', { replace: true })`. 에러 바운더리 포함. 모든 입력 필드에 `<label htmlFor>` 또는 `aria-label`, `aria-invalid`, `aria-describedby` 포함.
- [X] T009 [US2] Implement `RegisterPage` in `src/pages/auth/RegisterPage.tsx` — `RegisterForm` 렌더. 로그인 링크(`/login`). 로딩·에러·빈 상태 처리.

**Checkpoint**: 가입 → `/verify-email` 이동 확인. US4와 함께 E2E 검증 (가입→인증→온보딩)

---

## Phase 5: User Story 4 — 이메일 인증 (Priority: P1)

**Goal**: 인증 코드 입력 → `emailVerified=true` 갱신 → GateRoute가 온보딩으로 자동 이동.

**Independent Test**: MSW `200 { emailVerified: true }` 응답으로 authStore 갱신 확인. 재발송 버튼 MSW 200 응답으로 성공 안내 확인. US2 완료 후 가입→인증 E2E 검증.

- [X] T010 [US4] Add `requestEmailVerification(email: string)` and `verifyEmail(code: string)` to `src/lib/api/auth.ts` — `POST /api/v1/auth/email-verification/request` (200, no body), `POST /api/v1/auth/email-verification/verify` (200 `{ emailVerified?: boolean }`). 400(코드 불일치)·422(만료)·429(재전송 초과) 에러 처리.
- [X] T011 [US4] Implement `EmailVerifyForm` in `src/components/features/auth/EmailVerifyForm.tsx` — 6자리 숫자 코드 입력(`/^\d{6}$/` 검증). `verifyEmail(code)` 호출 → 성공 시 `authStore.setAuth({ ...user, emailVerified: true }, accessToken)` (getMe() 재호출 없이 직접 갱신). emailVerified 로컬 갱신 후 GateRoute 분기가 어긋나는 경우, getMe() 재조회로 권위 상태를 받아 authStore를 갱신하는 fallback을 둔다(기본은 로컬 갱신 유지). 재발송 버튼 → `requestEmailVerification(user.email)` → "인증 메일이 재발송됐습니다." 안내. 오류 메시지(코드 불일치·만료 구분). 로딩 중 버튼 비활성. 모든 입력 필드에 `<label htmlFor>` 또는 `aria-label`, `aria-invalid`, `aria-describedby` 포함.
- [X] T012 [US4] Implement `VerifyEmailPage` in `src/pages/auth/VerifyEmailPage.tsx` — `authStore`에서 `user.email` 읽기. `EmailVerifyForm` 렌더. 인증 성공 후 `EmailVerifyForm`이 `navigate('/home', { replace: true })` 호출 — `/verify-email`은 GateRoute 바깥(router.tsx)이므로 authStore 갱신만으로는 GateRoute가 재평가되지 않아 능동 navigate가 필요하며, GateRoute가 emailVerified=true·onboardingCompleted=false를 보고 `/onboarding`으로 라우팅한다. 로딩·에러 상태 처리. Empty state 해당 없음 — 폼 항상 표시됨(authStore에서 user.email 있을 때만 렌더).

**Checkpoint**: 가입 → 이메일 인증 → GateRoute → 온보딩 E2E 끊김없이 동작 확인 (004 게이트 포함)

---

## Phase 6: User Story 5 — 비밀번호 재설정 (Priority: P2)

**Goal**: 이메일 → 코드 → 새 비밀번호 3단계 완료 후 `/login` 이동.

**Independent Test**: MSW로 각 단계 성공·만료 응답 모킹, step 전환·완료 후 `/login` 이동 확인.

- [X] T013 [US5] Add `requestPasswordReset(email: string)`, `verifyPasswordResetCode(email: string, code: string)`, `confirmPasswordReset(resetToken: string, newPassword: string)` to `src/lib/api/auth.ts` — `POST /api/v1/auth/password-reset/request` (202, no body), `POST /api/v1/auth/password-reset/verify` (200 `{ resetToken: string }`), `POST /api/v1/auth/password-reset/confirm` (204, no body). 400·422·429·503 에러 처리.
- [X] T014 [US5] Implement `PasswordResetForm` in `src/components/features/auth/PasswordResetForm.tsx` — `step: 1 | 2 | 3` `useState` 관리. Step 1: 이메일 입력 → `requestPasswordReset()` → 202 → step 2 전환 + "재설정 메일 발송됨" 안내. Step 2: 6자리 코드 입력 → `verifyPasswordResetCode()` → `resetToken` 메모리 보관 → step 3 전환. Step 3: 새 비밀번호·확인 입력(8자+영문+숫자 검증) → `confirmPasswordReset(resetToken, newPassword)` → 204 → `navigate('/login')` + "비밀번호가 변경됐습니다." 안내. 만료·불일치 오류 메시지 처리. 모든 입력 필드에 `<label htmlFor>` 또는 `aria-label`, `aria-invalid`, `aria-describedby` 포함.
- [X] T015 [US5] Implement `ForgotPasswordPage` in `src/pages/auth/ForgotPasswordPage.tsx` — `PasswordResetForm` 렌더. "로그인으로" 링크(`/login`). 로딩·에러 상태 처리. Empty state 해당 없음 — PasswordResetForm 항상 표시.

**Checkpoint**: 비밀번호 재설정 3단계 흐름 완료 → `/login` 이동 확인

---

## Phase 7: User Story 3 — 소셜 로그인·가입 (Priority: P2)

**Goal**: 카카오·Google 소셜 로그인 완전 동작 (기존/신규 분기). Apple은 B-3-001 완료 후.

**Independent Test**: MSW로 `/callback` 200(기존 회원 → 토큰) 및 202(신규 → pendingToken) 모킹. SocialCallbackPage 분기·SocialConsentPage 약관 동의·completeSocialSignup() 확인.

- [X] T016 [P] [US3] Register GitHub issue B-3-001 via `gh issue create --repo 502-lab/news-pulse-back --title "[FE-blocked][005] Apple 소셜 form_post 백엔드 relay 미확인" --label "backend,blocked,api-missing" --body "## 발견 위치\n- spec / 화면: 005 소셜 로그인·가입 / SocialCallbackPage\n- 관련 파일: src/components/features/auth/SocialButtons.tsx\n\n## 배경\nApple은 response_mode=form_post로 SPA에 직접 POST → SPA가 직접 수신 불가.\n\n## 백엔드 요청\nform_post 수신 후 code·state·userJson을 GET redirect로 SPA(/oauth/callback)에 전달.\n\n## FE 임시조치\nApple 버튼 비활성 stub 유지.\n\n## 연관\nspecs/005-auth-screens"` (B-3 절차 준수, 이슈 번호 기록해 T020 TODO에 사용)
- [X] T017 [P] [US3] Add `getSocialAuthorizeUrl(provider: 'kakao' | 'google' | 'apple')`, `handleSocialCallback(provider, code, state, redirectUri, userJson?)`, `completeSocialSignup(body: SocialCompleteRequest)` to `src/lib/api/auth.ts` — GET /api/v1/auth/social/{provider}/authorize (200 `{ authorizeUrl }`), POST /api/v1/auth/social/{provider}/callback (200 기존 | 202 SocialPendingSignupResponse), POST /api/v1/auth/social/complete (201). 400·409 에러 처리. 경로·요청/응답 타입은 generated/api-types.ts 기준 (하드코딩 금지).
- [X] T018 [P] [US3] Implement `SocialCallbackPage` in `src/pages/auth/SocialCallbackPage.tsx` — `useRef(false)` StrictMode 이중호출 방지. 마운트 시 `sessionStorage.getItem('oauth_provider')` 미존재이면 `navigate('/login', { replace: true })`. `handleSocialCallback()` 호출: 200 → `setAuth()` + `navigate(roleHome, { replace: true })` | 202 → `navigate('/social-consent', { state: { pendingToken, provider, requiredTerms }, replace: true })` | 400(CSRF/state 불일치) → 오류 화면 + /login 링크 | 409(이메일 충돌) → "해당 이메일로 가입된 계정이 있습니다. 이메일로 로그인해 주세요." + /login 링크 | 그 외 → 일반 오류 메시지 + /login 링크. 처리 중 FullPageSpinner.
- [X] T019 [P] [US3] Implement `SocialConsentPage` in `src/pages/auth/SocialConsentPage.tsx` — `useLocation().state` 미존재이면 `navigate('/login', { replace: true })`. 상단 "[provider]로 가입을 완료하려면 약관에 동의해주세요" 안내 문구. `ConsentList(requiredTerms)` 재사용. 필수 항목 미동의 시 "가입 완료" 버튼 비활성. `completeSocialSignup()` → `setAuth()` + `navigate(roleHome, { replace: true })`. pendingToken 만료(400) → "만료되었습니다. 소셜 로그인을 다시 시도해주세요." + /login 링크.
- [X] T020 [P] [US3] Update `SocialButtons` in `src/components/features/auth/SocialButtons.tsx` — 카카오·Google 버튼: 클릭 시 `sessionStorage.setItem('oauth_provider', provider)` → `getSocialAuthorizeUrl(provider)` → `window.location.href = authorizeUrl`. Apple 버튼: `disabled` + `// TODO(#<B-3-001-이슈번호>): Apple form_post relay 백엔드 미구현` 주석.
- [X] T021 [US3] Add routes to `src/app/router.tsx` — `const socialCallbackPage = lazyPage(() => import('@/pages/auth/SocialCallbackPage'))` + `const socialConsentPage = lazyPage(() => import('@/pages/auth/SocialConsentPage'))`. `{ path: '/oauth/callback', element: socialCallbackPage }`, `{ path: '/social-consent', element: socialConsentPage }` — AuthShell 안 GuestOnly 밖 그룹에 추가.

**Checkpoint**: MSW로 카카오 신규/기존 분기 확인. Apple은 B-3-001 해결 후.

---

## Phase 8: User Story 6 — 약관 재동의 (Priority: P2)

**Goal**: `requiresReConsent=true` 사용자가 재동의 완료 후 GateRoute 통과.

**Independent Test**: MSW로 `requiresReConsent=true` 상태 설정 후 재동의 제출 → `requiresReConsent=false` 갱신·GateRoute 통과 확인. 거부 클릭 → logout → `/login` 이동 확인.

- [X] T022 [US6] Implement `ReConsentPage` in `src/pages/auth/ReConsentPage.tsx` — `useQuery(['terms','active'], getActiveTerms)` + `useQuery(['me','consents'], getConsents)` 조회 (로딩·에러·빈 상태 처리). 미동의 필수 약관만 표시(기동의 항목 제외). `useMutation(submitConsents)` onSuccess: `queryClient.invalidateQueries(['me','consents'])` + `authStore.setAuth({ ...user, requiresReConsent: false }, accessToken)` → GateRoute 자동 재진입. submitConsents 성공 후 requiresReConsent 로컬 갱신이 게이트와 어긋나면 getMe() 재조회로 서버 상태 확인하는 fallback(기본은 로컬 갱신 유지). "거부" 버튼 → `logout()` → `navigate('/login')`. "동의" 버튼 필수 항목 미동의 시 비활성.

**Checkpoint**: `requiresReConsent=true` 로그인 → `/re-consent` → 동의 → GateRoute 통과 확인

---

## Phase 9: User Story 7 — 약관·개인정보 열람 (Priority: P3)

**Goal**: 미인증 상태에서 `/terms`, `/privacy` 접근 시 정적 텍스트 표시.

**Independent Test**: 미인증 브라우저에서 `/terms`, `/privacy` 직접 접근 → 로그인 리다이렉트 없이 내용 표시. `/register` 내 "약관 보기" 링크 → `/terms` 이동 확인.

- [X] T023 [P] [US7] Register GitHub issue B-3-002 via `gh issue create --repo 502-lab/news-pulse-back --title "[FE][005] 약관 전문 백엔드 API 이관" --label "backend,enhancement" --body "## 발견 위치\n- spec / 화면: 005 약관 열람 / TermsPage·PrivacyPage\n- 관련 파일: src/constants/legalText.ts\n\n## 배경\nGET /api/v1/terms는 메타데이터만. 전문 콘텐츠 없음.\n\n## 백엔드 요청\n버전 관리되는 약관 전문 API(또는 정적 리소스).\n\n## FE 현재\nsrc/constants/legalText.ts 정적 텍스트 사용 중.\n\n## 연관\nspecs/005-auth-screens"` (비블로커 추적용, 이슈 번호 기록해 T024 TODO에 사용)
- [X] T024 [P] [US7] Extract LEGAL text from `~/Downloads/Newsift_screens/screens3.jsx` LEGAL 객체 and create `src/constants/legalText.ts` — `export const legalText = { SERVICE: '...', PRIVACY: '...' }` 문자열 상수 (텍스트 콘텐츠 이관, A-5 코드복사 위반 아님). `// TODO(#<B-3-002-이슈번호>): 버전 관리되는 백엔드 API로 이관` 주석.
- [X] T025 [P] [US7] Create `TermsPage` in `src/pages/legal/TermsPage.tsx` — AuthShell 내, 인증 불필요 공개 경로. `legalText.SERVICE` 스크롤 가능 영역(`overflow-y-auto max-h-[600px]`) 렌더. "뒤로 가기" 링크. `aria-label="서비스 이용약관"`.
- [X] T026 [P] [US7] Create `PrivacyPage` in `src/pages/legal/PrivacyPage.tsx` — `legalText.PRIVACY` 동일 패턴. `aria-label="개인정보처리방침"`.
- [X] T027 [US7] Add routes to `src/app/router.tsx` — `const termsPage = lazyPage(() => import('@/pages/legal/TermsPage'))` + `const privacyPage = lazyPage(() => import('@/pages/legal/PrivacyPage'))`. `{ path: '/terms', element: termsPage }`, `{ path: '/privacy', element: privacyPage }` — AuthShell 내 공개 그룹(GuestOnly 밖)에 추가.

**Checkpoint**: 미인증 상태 `/terms`, `/privacy` 접근 → 내용 표시, 리다이렉트 없음

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: 접근성 보완, 약관 링크 연결, 빌드·타입 검증.

- [X] T028 [P] Wire "약관 보기" links in `src/components/features/auth/RegisterForm.tsx` — "서비스 이용약관"·"개인정보처리방침" 텍스트를 `<Link to="/terms">`, `<Link to="/privacy">` 연결 (US7 T025~T027 완료 후)
- [X] T029 [P] Wire "약관 보기" links in `src/pages/auth/ReConsentPage.tsx` → `<Link to="/terms">`, `<Link to="/privacy">` 연결 (US7 완료 후)
- [X] T030 [P] Audit and complete aria attributes across all auth form components — `src/components/features/auth/LoginForm.tsx`, `RegisterForm.tsx`, `EmailVerifyForm.tsx`, `PasswordResetForm.tsx` 전체 필드에 `<label htmlFor>` 또는 `aria-label`, `aria-invalid={!!errors.field}`, `aria-describedby="field-error"` 완비 (SC-009)
- [X] T031 Run `pnpm tsc --noEmit` and fix all TypeScript errors (any 타입 금지, generated/api-types.ts 타입만 사용 확인)
- [X] T032 Run `pnpm build` and verify build succeeds with no warnings/errors
- [X] T033 Run quickstart.md S-1~S-7 validation scenarios — MSW handlers 작성: `src/__tests__/loginPage.test.tsx`, `registerPage.test.tsx`, `verifyEmailPage.test.tsx`, `forgotPasswordPage.test.tsx`, `socialCallback.test.tsx`, `socialConsent.test.tsx`, `legalPages.test.tsx` (pnpm test 전체 통과 확인). SC-001 검증: `userEvent` + `vi.useFakeTimers()`로 login submit 후 500ms 이내 navigate 확인 포함.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — T001, T002 즉시 병렬 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 — T003 ConsentList은 US2·US3·US6 BLOCK
- **US1 (Phase 3)**: Phase 2 완료 후 — T004, T005 병렬 가능
- **US2 (Phase 4)**: Phase 2 완료 후 — T003(ConsentList) 필요
- **US4 (Phase 5)**: Phase 1 완료 후 독립 — US2와 E2E 검증 필요
- **US5 (Phase 6)**: Phase 1 완료 후 독립 — US1~US4와 완전 독립
- **US3 (Phase 7)**: Phase 2 완료 + US1 T005(SocialButtons stub) 완료 후
- **US6 (Phase 8)**: Phase 1 T002(terms.ts) + Phase 2 T003(ConsentList) 완료 후
- **US7 (Phase 9)**: Phase 1 완료 후 독립 (legalText.ts는 별도 파일)
- **Polish (Phase 10)**: 원하는 Story 완료 후

### User Story Dependencies

| Story | Priority | 선행 조건 | 독립 테스트 가능 |
|---|---|---|---|
| US1 | P1 | Phase 2 완료 | ✅ |
| US2 | P1 | Phase 2 완료 | ✅ (E2E는 US4 필요) |
| US4 | P1 | Phase 1 완료 | ✅ (E2E는 US2 필요) |
| US5 | P2 | Phase 1 완료 | ✅ |
| US3 | P2 | US1(T005) + Phase 2 | ✅ |
| US6 | P2 | Phase 1(T002) + Phase 2(T003) | ✅ |
| US7 | P3 | Phase 1(T001 for readiness) | ✅ |

### Within Each User Story

- API 함수(auth.ts 추가) → 컴포넌트 → 페이지 순서
- 같은 파일 수정 작업(auth.ts)은 순서대로 진행 (T007→T010→T013→T017)
- router.tsx 수정: T021(US3) → T027(US7) 순서대로 (충돌 방지)
- T017 `[P]` 마커는 T016(gh 이슈, 별도 작업)과의 병렬만 의미. auth.ts는 단독 수정 파일로 T007→T010→T013→T017 순서 유지 (T016과만 병렬 가능, T007·T010·T013과 병렬 금지)

### Parallel Opportunities

```
Phase 1:   T001 ‖ T002
Phase 3:   T004 ‖ T005  (then T006)
Phase 7:   T016 ‖ T017  (then T018 ‖ T019 ‖ T020, then T021)
Phase 9:   T023 ‖ T024  (then T025 ‖ T026, then T027)
Phase 10:  T028 ‖ T029 ‖ T030  (then T031 → T032 → T033)
```

---

## Parallel Example: Phase 7 (US3)

```bash
# Step 1: T016과 T017 병렬 (GitHub 이슈 등록 ‖ API 함수 구현)
Task: "Register B-3-001 issue on GitHub"
Task: "Add social auth functions to src/lib/api/auth.ts"

# Step 2: T017 완료 후 T018/T019/T020 병렬 (다른 파일)
Task: "Implement SocialCallbackPage in src/pages/auth/SocialCallbackPage.tsx"
Task: "Implement SocialConsentPage in src/pages/auth/SocialConsentPage.tsx"
Task: "Update SocialButtons in src/components/features/auth/SocialButtons.tsx"

# Step 3: T021 (위 3개 완료 후)
Task: "Add /oauth/callback, /social-consent routes to src/app/router.tsx"
```

---

## Implementation Strategy

### MVP First (P1: US1 + US2 + US4)

1. Phase 1 Setup → T001, T002 병렬
2. Phase 2 Foundational → T003
3. Phase 3 US1 → T004, T005 병렬 → T006
4. Phase 4 US2 → T007 → T008 → T009
5. Phase 5 US4 → T010 → T011 → T012
6. **STOP & VALIDATE**: 가입→이메일 인증→GateRoute→온보딩 E2E 검증
7. Deploy/demo if ready

### Incremental Delivery

| 단계 | 완료 Story | 검증 포인트 |
|---|---|---|
| MVP | US1+US2+US4 | 가입→인증→온보딩 E2E |
| + | US5 | 비밀번호 재설정 3단계 |
| + | US3 | 카카오·Google 소셜 가입/로그인 |
| + | US6 | 재동의 게이트 |
| + | US7 | 약관 공개 열람 |
| 완료 | Polish | 접근성·빌드 검증 |

### Parallel Team Strategy (2인)

- **Dev A**: US1 → US2 → US4 (P1 전체)
- **Dev B**: US5 → US7 (독립적, B-3 이슈 등록 포함)
- **합류**: US3 (Dev A의 SocialButtons stub T005 필요) + US6

---

## Notes

- **004 stubs**: `LoginPage.tsx`, `RegisterPage.tsx`, `VerifyEmailPage.tsx`, `ForgotPasswordPage.tsx`, `ReConsentPage.tsx`는 004 stub을 real 구현으로 교체. 파일 경로 동일, 기존 내용 대체.
- **auth.ts 추가**: 기존 `src/lib/api/auth.ts`에 함수 추가. 전체 재작성 금지. T007→T010→T013→T017 순서대로 진행.
- **router.tsx 분산 수정**: T021(US3)과 T027(US7)이 동일 파일 수정. 순서대로 진행, 충돌 주의.
- **B-3 이슈 우선 등록**: T016(B-3-001), T023(B-3-002)은 관련 구현 전 먼저 실행. 발급된 이슈 번호를 T020, T024 TODO 주석에 기입.
- **pendingToken**: localStorage·sessionStorage·Zustand 저장 금지. React Router navigate state 전달만 허용.
- **ConsentList 재사용**: US2(RegisterForm T008) → US3(SocialConsentPage T019) → US6(ReConsentPage T022) 동일 컴포넌트 import.
