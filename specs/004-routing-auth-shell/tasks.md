# Tasks: 004 라우팅·인증 골격

**Input**: Design documents from `specs/004-routing-auth-shell/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/auth-api.md ✅

**Tests**: quickstart.md의 7개 시나리오를 기준으로 핵심 가드 로직·인터셉터에 대한 단위 테스트 포함. 지금 미설치인 Vitest + RTL + MSW는 Phase 1에서 설치.

**Organization**: 6개 User Story 우선순위(P1×2 → P2×3 → P3×1) 순서로 페이즈 구성.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 상호 의존 없음)
- **[Story]**: 해당 태스크가 속한 User Story (US1~US6)
- 모든 경로는 프로젝트 루트 기준

---

## Phase 1: Setup (패키지 설치 & 테스트 환경)

**Purpose**: 신규 패키지 설치 및 테스트 인프라 구성. 이후 모든 페이즈의 전제 조건.

- [X] T000 openapi-typescript codegen 실행 — `pnpm generate:types` → `generated/api-types.ts` 생성
  - package.json에 `"generate:types": "openapi-typescript spec/api-contract/openapi.yaml -o generated/api-types.ts"` 이미 추가됨 (`openapi-typescript@7.13.0` devDependency 설치 완료)
  - news-pulse-spec#1 수정 완료 → submodule 업데이트 후 codegen 완료 (generated/api-types.ts 1943 lines)
- [X] T001 pnpm으로 런타임 패키지 설치: `pnpm add zustand @tanstack/react-query axios`
- [X] T002 pnpm으로 개발 패키지 설치: `pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom msw jsdom`
- [X] T003 [P] Vitest 설정 — `vitest.config.ts` 생성 (environment: jsdom, setupFiles: src/__tests__/setup.ts, globals: true)
- [X] T004 [P] MSW 테스트 셋업 — `src/__tests__/setup.ts` 및 `src/__tests__/mocks/handlers.ts` 생성 (auth 엔드포인트 핸들러: POST /api/v1/auth/login, POST /api/v1/auth/refresh, POST /api/v1/auth/logout, GET /api/v1/me)
- [X] T005 [P] 모든 placeholder·슬롯 페이지 컴포넌트 생성 — `src/pages/` 아래 전체 파일 (최소 JSX: `export default function XxxPage() { return <div>placeholder</div> }`)
  - `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `VerifyEmailPage.tsx`, `ReConsentPage.tsx`
  - `src/pages/onboarding/OnboardingPage.tsx`
  - `src/pages/user/HomePage.tsx`, `TrendsPage.tsx`, `BiasPage.tsx`, `ArticleDetailPage.tsx`, `ComparePage.tsx`, `InsightsPage.tsx`, `WeeklyPage.tsx`, `SettingsPage.tsx`
  - `src/pages/admin/AdminHomePage.tsx`, `IngestionPage.tsx`, `ContentPage.tsx`, `UsersAdminPage.tsx`, `NoticePage.tsx`
  - `src/pages/error/NotFoundPage.tsx`

**Checkpoint**: ✅ 패키지 설치 완료, `pnpm dev` 및 `pnpm vitest run` 오류 없이 실행 가능

---

## Phase 2: Foundational (모든 User Story의 전제 블로킹 레이어)

**Purpose**: 인증 스토어·API 클라이언트·기본 앱 구조. 이 페이즈 미완료 시 어느 User Story도 시작 불가.

**⚠️ CRITICAL**: 이 페이즈가 완료되어야 Phase 3 이후 작업을 병렬 진행할 수 있음

- [X] T006 `src/lib/tokenStorage.ts` 구현 — `getRefreshToken()`, `setRefreshToken(token)`, `clearRefreshToken()` (localStorage key: `'rt'`)
- [X] T007 `src/stores/authStore.ts` 구현 — Zustand store: `user: AuthUser|null`, `accessToken: string|null`, `isLoading: boolean`, 액션: `setAuth`, `setAccessToken`, `clearAuth`, `setLoading` (persist 없음, `/generated/api-types.ts`의 `AccountSummary` 타입 사용)
- [X] T008 [P] `src/lib/api/client.ts` 구현 — Axios 인스턴스 (baseURL: `import.meta.env.VITE_API_URL`, Content-Type: application/json, 401 인터셉터 없는 기본 버전 — T022에서 추가)
- [X] T009 [P] `src/lib/api/auth.ts` 구현 — `login(email, password)`, `logout(refreshToken)`, `refreshToken(refreshToken)`, `getMe()` API 함수 (T008 client 사용, `/generated/api-types.ts` 타입)
- [X] T010 `src/app/App.tsx` 구성 — `QueryClientProvider` + `RouterProvider` 마운트 (staleTime default 설정, router는 T014에서 완성)

**Checkpoint**: ✅ `pnpm dev` 실행 시 앱 기동, Zustand store import 가능, API 함수 호출 준비 완료

---

## Phase 3: User Story 1 — 게스트 접근 차단 + returnTo 복귀 (Priority: P1) 🎯 MVP

**Goal**: 미인증 사용자가 보호 경로 접근 시 `/login?returnTo=<현재경로>`로 이동하고, 로그인 성공 후 원래 경로로 복귀. 인증된 사용자는 `/login`, `/register` 접근 시 역할별 홈으로 리다이렉트.

**Independent Test**: 미인증 상태에서 `/home` 접근 → `/login?returnTo=%2Fhome` 확인. 로그인 후 `/home` 복귀 확인. `pnpm vitest run src/__tests__/RouteGuards.test.tsx` 통과.

- [X] T011 [P] [US1] `src/components/guards/ProtectedRoute.tsx` 구현 — `isLoading=true`이면 `<FullPageSpinner>`, `user=null`이면 `<Navigate to="/login" state={{ returnTo: location.pathname + location.search }} replace>`, 인증 시 `<Outlet>` 렌더
- [X] T012 [P] [US1] `src/components/guards/GuestOnlyRoute.tsx` 구현 — 인증된 사용자(`user !== null`)가 접근하면 `role === 'ADMIN'` → `/admin`, `USER` → `/home`으로 `<Navigate replace>`, 게스트면 `<Outlet>` 렌더
- [X] T013 [P] [US1] `src/components/layout/AuthShell.tsx` 구현 — 중앙 카드 레이아웃 (`max-w-[400px]`, canvas 배경, 상단 브랜드마크 영역, 하단 `<Outlet>`). 디자인 토큰은 CSS 변수(`@theme`) 사용.
- [X] T014 [US1] `src/app/router.tsx` 생성 — `createBrowserRouter` 전체 라우트 트리 구성
  - 공개(GuestOnlyRoute + AuthShell): `/login`, `/register`, `/forgot-password`
  - 공개(AuthShell만, 인증 무관): `/terms`, `/privacy`
  - 보호(ProtectedRoute 안 + **GateRoute 밖**): `/verify-email`, `/re-consent`, `/onboarding`
  - 보호(ProtectedRoute 안 + GateRoute 안): USER·ADMIN 나머지 경로 전체
  - 와일드카드: `*` → `NotFoundPage`
- [X] T015 [US1] `src/__tests__/RouteGuards.test.tsx` 작성 — 6개 테스트 통과

**Checkpoint**: ✅ US1 독립 검증 — 테스트 통과

---

## Phase 4: User Story 2 — 새로고침·탭 재오픈 후 세션 유지 (Priority: P1)

**Goal**: 앱 시작 시 localStorage의 refreshToken으로 자동 세션 복원. 복원 중에는 보호 경로에서 리다이렉트 없이 스피너만 표시. 토큰 만료·없을 시 게스트 상태로 폴백.

**Independent Test**: 로그인 후 새로고침 → `/home` 유지. `pnpm vitest run src/__tests__/authStore.test.ts` 통과.

- [X] T016 [US2] `src/providers/AuthProvider.tsx` 구현 — 마운트 시 `restoreSession()` 실행
- [X] T017 [US2] `src/app/App.tsx` 업데이트 — `AuthProvider`를 `RouterProvider` 바깥에 래핑
- [X] T018 [US2] `src/__tests__/authStore.test.ts` 작성 — 3개 테스트 통과

**Checkpoint**: ✅ US2 독립 검증 — 테스트 통과

---

## Phase 5: User Story 3 — 로그인 후 접근 게이트 우선순위 (Priority: P2)

**Goal**: 인증 완료 후 계정 상태에 따라 순서대로 안내: requiresReConsent → /re-consent, !emailVerified → /verify-email, !onboardingCompleted → /onboarding, 모두 통과 → 역할별 홈.

**Independent Test**: MSW로 각 계정 상태 조합 모킹 → 기대 리다이렉트 경로 확인. `pnpm vitest run src/__tests__/gateRedirect.test.tsx` 통과.

- [X] T019 [US3] `src/components/guards/GateRoute.tsx` 구현 — 게이트 우선순위 구현
- [X] T020 [US3] `src/app/router.tsx` 업데이트 — `ProtectedRoute` 안에 `GateRoute` 중첩
  - **라우트 트리**: `/verify-email`, `/re-consent`, `/onboarding`은 `ProtectedRoute > [게이트 목적지]`, 나머지는 `ProtectedRoute > GateRoute > [경로]`
- [X] T021 [US3] `src/__tests__/gateRedirect.test.tsx` 작성 — 7개 테스트 통과 (통합 케이스 포함)

**Checkpoint**: ✅ US3 독립 검증 — 테스트 통과

---

## Phase 6: User Story 4 — 인증 토큰 자동 갱신 (Priority: P2)

**Goal**: API 401 응답 시 사용자 인지 없이 자동 갱신 후 원 요청 재시도. 동시 다수 401에서 갱신 1회. 갱신 실패 시 강제 로그아웃.

**Independent Test**: `pnpm vitest run src/__tests__/authInterceptor.test.ts` 통과.

- [X] T022 [US4] `src/lib/api/client.ts` 업데이트 — 401 갱신 큐 인터셉터 추가
  - `/auth/refresh` URL 자체 401 시 무한루프 방지 (`isRefreshEndpoint` 체크)
- [X] T023 [US4] `src/__tests__/authInterceptor.test.ts` 작성 — 3개 테스트 통과

**Checkpoint**: ✅ US4 독립 검증 — 테스트 통과

---

## Phase 7: User Story 5 — 역할별 레이아웃 분기 및 접근 제어 (Priority: P2)

**Goal**: USER → 상단 GNB 5탭 레이아웃, ADMIN → 좌측 navy 사이드바 레이아웃. USER의 /admin/* 접근 차단 → /home 리다이렉트.

**Independent Test**: USER로 `/admin` 직접 접근 → `/home` 리다이렉트. ADMIN으로 `/admin` 접근 → 사이드바 레이아웃 렌더.

- [X] T024 [P] [US5] `src/components/layout/UserGnbLayout.tsx` 구현 — 상단 GNB (brand 색상, 5탭: 홈·트렌드·편향분석·인사이트·브리핑, 검색 아이콘 숨김, 프로필 메뉴+로그아웃)
- [X] T025 [P] [US5] `src/components/layout/AdminSidebarLayout.tsx` 구현 — 좌측 navy(`bg-navy-800`) 사이드바 `w-60`, 5메뉴, 하단 로그아웃
- [X] T026 [P] [US5] `src/components/guards/AdminRoute.tsx` 구현 — `user?.role !== 'ADMIN'`이면 `/home` 리다이렉트
- [X] T027 [US5] `src/app/router.tsx` 업데이트 — UserGnbLayout + AdminRoute + AdminSidebarLayout 래핑 완료
  - **최종 라우트 트리**: 공개(AuthShell) + 게이트 밖 보호(3개) + `ProtectedRoute > GateRoute > UserGnbLayout > [USER]` + `ProtectedRoute > GateRoute > AdminRoute > AdminSidebarLayout > [ADMIN]`

**Checkpoint**: ✅ US5 독립 검증 완료

---

## Phase 8: User Story 6 — 로그아웃 (Priority: P3)

**Goal**: 프로필 메뉴 로그아웃 클릭 시 서버 세션 무효화 → 인증 상태 초기화 → /login 이동. API 실패 시에도 클라이언트 상태 동일하게 초기화.

- [X] T028 [US6] `src/stores/authStore.ts` 업데이트 — `logout()` 액션 추가: `clearRefreshToken()` + `clearAuth()` (API 호출은 컴포넌트에서 처리하여 순환 의존성 방지)
- [X] T029 [US6] `src/components/layout/UserGnbLayout.tsx` — 로그아웃 버튼: `logoutApi(rt)` 호출(try/catch) → `store.logout()` → `navigate('/login')`
- [X] T030 [US6] `src/components/layout/AdminSidebarLayout.tsx` — 사이드바 하단 로그아웃 버튼: 동일 플로우

**Checkpoint**: ✅ US6 구현 완료

---

## Phase 9: Polish & 횡단 관심사

**Purpose**: 헌법 준수 강화(코드 스플리팅·에러 경계), 접근성 최종 점검, 검증 실행.

- [X] T031 [P] `src/app/router.tsx` 업데이트 — 모든 페이지 컴포넌트에 `React.lazy` + `Suspense` 적용 (`lazyPage` 헬퍼 함수)
- [X] T032 [P] `src/app/App.tsx` 업데이트 — `RouterProvider`를 `ErrorBoundary` 클래스 컴포넌트로 래핑
- [X] T033 접근성 검토 완료 — `FullPageSpinner` `role="status"` + `aria-label` 추가, NavLink `aria-current="page"` 자동 적용 (React Router), 사이드바·GNB `aria-label` 적용
- [X] T034 `pnpm tsc --noEmit` 실행 — TypeScript 컴파일 에러 0개 확인 (SC-007) ✅
- [ ] T035 quickstart.md의 7개 수동 검증 시나리오 실행 — S-1~S-7 순서대로 확인 후 이상 항목 기록

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 즉시 시작 가능
- **Phase 2 (Foundational)**: Phase 1 완료 후 — 모든 User Story 블로킹
- **Phase 3~8 (User Stories)**: Phase 2 완료 후 순서대로 진행 (P1 먼저)
  - US1(Phase 3) → US2(Phase 4) 순서 권장 (US2의 AuthProvider가 US1 isLoading 동작에 의존)
  - US3~US5(Phase 5~7)는 Phase 2 완료 후 서로 독립적으로 진행 가능
  - US6(Phase 8): US5 완료 후 (레이아웃에 로그아웃 버튼 추가)
- **Phase 9 (Polish)**: 모든 User Story 완료 후

### User Story Dependencies

- **US1 (P1)**: Phase 2 완료 후 즉시 시작 — 독립
- **US2 (P1)**: Phase 2 + US1 완료 후 권장 (isLoading 동작 통합 테스트)
- **US3 (P2)**: Phase 2 완료 후 — US1·US2와 독립
- **US4 (P2)**: Phase 2 완료 후 — 다른 Story와 독립 (client.ts 수정만)
- **US5 (P2)**: Phase 2 완료 후 — US1·US2와 독립
- **US6 (P3)**: US5 완료 후 (레이아웃 컴포넌트 수정)

### Within Each User Story

- 가드 컴포넌트 → 라우터 설정 순서
- 라우터 설정 완료 후 테스트 작성 또는 병행 가능
- [P] 표시 태스크는 동시 진행 가능

---

## Implementation Strategy

### MVP First (US1 + US2만)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (CRITICAL)
3. Phase 3: US1 — 게스트 차단 + returnTo
4. Phase 4: US2 — 세션 복원
5. **STOP & VALIDATE**: `pnpm vitest run` 통과, quickstart.md S-1·S-2 확인
6. 인증 골격 최소 동작 완료 — 005 auth 화면 구현 진입 가능

### Incremental Delivery

1. Setup + Foundational → 앱 기동 가능
2. US1 완료 → 게스트 차단 동작 (S-1 검증)
3. US2 완료 → 세션 복원 동작 (S-2 검증)
4. US3 완료 → 게이트 우선순위 동작 (S-3 검증)
5. US4 완료 → 자동 토큰 갱신 (S-6 검증)
6. US5 완료 → 역할별 레이아웃 분기 (S-4·S-5 검증)
7. US6 완료 → 로그아웃 (S-7 검증)
8. Polish → 헌법 완전 준수

---

## Notes

- `[P]` 태스크 = 다른 파일, 의존성 없음 → 동시 실행 가능
- `[USn]` 라벨로 User Story별 추적 가능
- 모든 테스트는 `pnpm vitest run` 또는 `pnpm vitest run <file>`로 실행
- 커밋은 각 Checkpoint 또는 논리적 단위로 (1 태스크 = 1 커밋 권장)
- `/generated/api-types.ts`가 없으면 T007·T009 작성 전에 openapi 타입 생성 필요
- 헌법 §III: 모든 가드 컴포넌트에 로딩·에러·빈 상태 처리 필수
