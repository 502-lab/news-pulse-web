---
description: "Task list for 002 레이아웃 & 네비게이션 셸"
---

# Tasks: 002 레이아웃 & 네비게이션 셸

**Input**: Design documents from `/specs/002-layout-nav-shell/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: 테스트 없음 (스펙 미요청 — quickstart.md의 수동 시나리오 S-01~S-08로 검증)

**Organization**: 4개 user story(US1~US4) + Setup/Foundational/Integration 구조

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 완료되지 않은 태스크에 비의존)
- **[Story]**: US1/US2/US3/US4 — spec.md 사용자 스토리 매핑
- 각 태스크에 정확한 파일 경로 포함

---

## Phase 1: Setup

**Purpose**: 패키지 설치 + 빌드 도구 설정 + Icon 컴포넌트 확장

- [X] T001 `react-router-dom` 설치: `pnpm add react-router-dom` (미설치 확인 후 실행)
- [X] T002 `@types/node` 설치: `pnpm add -D @types/node` (vite.config.ts의 `import path` 타입 지원)
- [X] T003 `vite.config.ts`에 `@/` path alias 추가 — `resolve.alias: { '@': path.resolve(__dirname, './src') }` (기존 plugins 유지)
- [X] T004 `src/components/ui/Icon.tsx` LUCIDE_MAP 확장 — `LayoutDashboard`, `Loader2` import 추가 및 map 등록; `TrendingUp`, `Scale`, `Activity`, `Users` 풀네임 키 추가 (기존 단축 키 유지)

**Checkpoint**: `pnpm tsc --noEmit` 에러 없음, `@/components/ui` import 경로 동작 확인

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story에 공통으로 필요한 데이터 계층, 공유 UI 원소, 핵심 셸 컴포넌트

**⚠️ CRITICAL**: Phase 2 완료 전까지 어떤 user story도 시작 불가

- [X] T005 [P] `src/store/auth.mock.ts` 생성 — `AuthUser`, `AuthStore` 인터페이스 및 `useAuthStore` mock 함수 (role: 'USER', isLoading: false 기본값)
- [X] T006 [P] `src/store/auth.ts` 생성 — `auth.mock.ts` re-export 진입점 (007에서 실제 구현 교체 시 이 파일만 수정)
- [X] T007 [P] `src/constants/nav.ts` 생성 — `NavItemDef` 인터페이스, `NAV_USER` (3개), `NAV_ADMIN` (5개) 상수
- [X] T008 [P] `src/components/common/FullPageSpinner.tsx` 생성 — `Icon name="Loader2" size={32} animate-spin text-brand`, `bg-canvas h-screen` 레이아웃
- [X] T009 [P] `src/components/nav/NavItem.tsx` 생성 — `NavLink` + `end={to === '/'}` + `isActive` 콜백으로 활성/비활성 스타일 분기
- [X] T010 `src/components/nav/Sidebar.tsx` 생성 — 로고(spark2 아이콘 + "NewsPulse"), nav 영역(role 기반 navItems), 유저 영역(user null이면 숨김) (T007, T009 필요)
- [X] T011 `src/components/nav/ProtectedRoute.tsx` 생성 — isLoading → FullPageSpinner, user null → Navigate /login, else → Outlet (T005, T006, T008 필요)
- [X] T012 `src/components/nav/AdminRoute.tsx` 생성 — `user?.role !== 'ADMIN'` → Navigate /, else → Outlet (T005, T006 필요)
- [X] T013 `src/layouts/AppShell.tsx` 생성 — `flex h-screen bg-canvas overflow-hidden`, Sidebar + `<main className="flex-1 overflow-y-auto">` + Outlet (T010 필요)
- [X] T014 `src/components/nav/index.ts` 생성 — Sidebar, NavItem, ProtectedRoute, AdminRoute barrel export; `AppShell.tsx` Sidebar import를 `@/components/nav`로 업데이트 (T010~T013 필요)

**Checkpoint**: Phase 2 완료 후 TypeScript 에러 없음. User story 구현 시작 가능.

---

## Phase 3: User Story 1 — 인증된 사용자 앱 진입 (Priority: P1) 🎯 MVP

**Goal**: USER role mock으로 `/` 접근 시 AppShell + Sidebar + DashboardPage placeholder 렌더. 사이드바 네비게이션으로 경로 이동 가능.

**Independent Test** (quickstart.md S-01, S-02):
`auth.mock.ts` 기본값 유지 → `pnpm dev` → `/` 접근 → Sidebar + 대시보드 placeholder 확인. "트렌드 분석" 클릭 → URL `/trends`, NavItem 활성 스타일 확인.

- [X] T015 [P] [US1] `src/pages/DashboardPage.tsx` 생성 — placeholder: `대시보드 — 003에서 구현`
- [X] T016 [P] [US1] `src/pages/TrendsPage.tsx` 생성 — placeholder: `트렌드 분석 — 004에서 구현`
- [X] T017 [P] [US1] `src/pages/BiasPage.tsx` 생성 — placeholder: `편향 분석 — 004에서 구현`
- [X] T018 [P] [US1] `src/pages/ArticleDetailPage.tsx` 생성 — placeholder: `기사 상세 — 005에서 구현`

**Checkpoint**: 4개 페이지 파일 생성 완료. router.tsx 연결 후 S-01/S-02 시나리오 통과.

---

## Phase 4: User Story 2 — 비인증 사용자 리다이렉트 (Priority: P1)

**Goal**: user null mock 시 `/` 접근 → `/login` 리다이렉트. isLoading=true mock 시 FullPageSpinner. `/login`은 Sidebar 없이 단독 렌더.

**Independent Test** (quickstart.md S-03, S-05):
`auth.mock.ts`에서 `user: null` 설정 → `/` 접근 → `/login` 리다이렉트 확인.
`isLoading: true, user: null` 설정 → FullPageSpinner 표시 확인.

- [X] T019 [P] [US2] `src/pages/auth/LoginPage.tsx` 생성 — placeholder: `로그인 — 007에서 구현`
- [X] T020 [P] [US2] `src/pages/auth/RegisterPage.tsx` 생성 — placeholder: `회원가입 — 007에서 구현`
- [X] T021 [P] [US2] `src/pages/auth/ForgotPage.tsx` 생성 — placeholder: `비밀번호 찾기 — 007에서 구현`

**Checkpoint**: 3개 auth 페이지 생성. router.tsx 연결 후 `/login` Sidebar 없이 렌더, S-03/S-05 통과.

---

## Phase 5: User Story 3 — ADMIN 전용 라우트 접근 제어 (Priority: P2)

**Goal**: role=ADMIN mock 시 `/admin/monitor` 접근 가능 + NAV_ADMIN 5개 항목 표시. role=USER mock 시 `/` 리다이렉트.

**Independent Test** (quickstart.md S-06, S-07):
`role: 'USER'` → `/admin/monitor` → `/` 리다이렉트.
`role: 'ADMIN'` → `/admin/monitor` → MonitorPage + NAV_ADMIN 5개 항목.

- [X] T022 [P] [US3] `src/pages/admin/MonitorPage.tsx` 생성 — placeholder: `시스템 모니터링 — 006에서 구현`
- [X] T023 [P] [US3] `src/pages/admin/UsersPage.tsx` 생성 — placeholder: `사용자 관리 — 006에서 구현`

**Checkpoint**: 2개 admin 페이지 생성. router.tsx 연결 후 S-06/S-07 통과.

---

## Phase 6: User Story 4 — 404 및 공개 경로 처리 (Priority: P3)

**Goal**: 미정의 경로 → NotFoundPage (Sidebar 없음). `/terms`, `/privacy` → 단독 렌더.

**Independent Test** (quickstart.md S-04):
`/존재안하는경로` → 404 텍스트 + "홈으로 돌아가기" 링크, Sidebar 없음.

- [X] T024 [P] [US4] `src/pages/NotFoundPage.tsx` 생성 — 404 텍스트, "페이지를 찾을 수 없습니다.", `Link to="/"` 홈 링크, `bg-canvas h-screen` (Sidebar 없음)
- [X] T025 [P] [US4] `src/pages/legal/TermsPage.tsx` 생성 — placeholder: `이용약관 — 007에서 구현`
- [X] T026 [P] [US4] `src/pages/legal/PrivacyPage.tsx` 생성 — placeholder: `개인정보처리방침 — 007에서 구현`

**Checkpoint**: 3개 공개 경로 페이지 생성. router.tsx 연결 후 S-04 통과.

---

## Phase 7: Integration (라우트 트리 + 진입점 연결)

**Purpose**: 모든 컴포넌트와 페이지를 라우트 트리로 조립하고 앱 진입점에 연결

- [X] T027 `src/router.tsx` 생성 — `createBrowserRouter` 라우트 트리 작성: 공개 5개 경로(`/login`, `/register`, `/forgot`, `/terms`, `/privacy`) + ProtectedRoute > AppShell > 보호 경로(index/trends/bias/articles/:id) + AdminRoute > admin 경로 + `* → NotFoundPage` (T015~T026 필요)
- [X] T028 `src/main.tsx` 수정 — `import App from './App'` 및 `<App />` 제거, `RouterProvider router={router}` 로 교체. 기존 css import(`./index.css`) 경로 유지 (T027 필요)

**Checkpoint (quickstart.md S-01~S-08 전체 검증)**:
- [X] T029 `pnpm tsc --noEmit` — TypeScript 에러 0개
- [X] T030 `pnpm dev` — S-01 `/` → AppShell + Sidebar + DashboardPage placeholder ✓
- [X] T031 S-02 Sidebar "트렌드 분석" 클릭 → `/trends`, 활성 스타일 ✓; `/` NavItem 비활성 ✓
- [X] T032 S-03 `/login` → Sidebar 없음, LoginPage placeholder ✓
- [X] T033 S-04 `/없는경로` → NotFoundPage, Sidebar 없음 ✓
- [X] T034 S-05 `isLoading: true` mock → FullPageSpinner ✓ (mock 원복)
- [X] T035 S-06 `role: 'USER'` + `/admin/monitor` → `/` 리다이렉트 ✓
- [X] T036 S-07 `role: 'ADMIN'` + `/admin/monitor` → NAV_ADMIN 5개 항목 + MonitorPage ✓ (mock 원복)
- [X] T037 S-08 `/trends` 후 새로고침 → `/trends` 유지 ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 시작 — 모든 user story 블로킹
- **US1~US4 (Phase 3~6)**: Phase 2 완료 후 **병렬 시작 가능** (모두 다른 파일, 비의존)
- **Integration (Phase 7)**: Phase 3~6 모두 완료 후 시작

### User Story Dependencies

- **US1 (P1)**: Foundational 완료 후 독립 구현 가능
- **US2 (P1)**: Foundational 완료 후 독립 구현 가능 (US1과 병렬)
- **US3 (P2)**: Foundational 완료 후 독립 구현 가능 (AdminRoute는 Phase 2에 포함)
- **US4 (P3)**: Foundational 완료 후 독립 구현 가능

### Within Each User Story

- 각 story의 페이지 파일들은 모두 [P] — 한 번에 병렬 생성 가능
- Phase 3~6의 모든 태스크는 서로 다른 파일 → 완전 병렬

### Parallel Opportunities

```bash
# Phase 1 완료 후, Phase 2 병렬 가능:
T005 (auth.mock.ts) + T006 (auth.ts) + T007 (nav.ts) + T008 (FullPageSpinner) + T009 (NavItem)

# T005-T009 완료 후:
T010 (Sidebar) + T011 (ProtectedRoute) + T012 (AdminRoute)

# Phase 2 완료 후, Phase 3~6 완전 병렬:
T015~T018 (US1 페이지) + T019~T021 (US2 페이지) + T022~T023 (US3 페이지) + T024~T026 (US4 페이지)
```

---

## Parallel Example: Phase 3~6

```bash
# Phase 2 완료 즉시 모두 동시 실행 가능:
Task T015: "src/pages/DashboardPage.tsx 생성"
Task T016: "src/pages/TrendsPage.tsx 생성"
Task T017: "src/pages/BiasPage.tsx 생성"
Task T018: "src/pages/ArticleDetailPage.tsx 생성"
Task T019: "src/pages/auth/LoginPage.tsx 생성"
Task T020: "src/pages/auth/RegisterPage.tsx 생성"
Task T021: "src/pages/auth/ForgotPage.tsx 생성"
Task T022: "src/pages/admin/MonitorPage.tsx 생성"
Task T023: "src/pages/admin/UsersPage.tsx 생성"
Task T024: "src/pages/NotFoundPage.tsx 생성"
Task T025: "src/pages/legal/TermsPage.tsx 생성"
Task T026: "src/pages/legal/PrivacyPage.tsx 생성"
# → 12개 파일 동시 생성, 충돌 없음
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001~T004)
2. Phase 2: Foundational (T005~T014)
3. Phase 3: US1 페이지 (T015~T018)
4. Phase 7: T027 (router.tsx — US1 경로만), T028 (main.tsx)
5. **STOP and VALIDATE**: S-01, S-02 시나리오 수동 검증
6. 이후 Phase 4~6 추가하여 전체 완성

### Incremental Delivery

1. Setup + Foundational → 셸/라우터 인프라 준비
2. US1 페이지 + Integration → 기본 앱 진입 동작 (MVP)
3. US2 페이지 추가 → 비인증 리다이렉트 동작
4. US3 페이지 추가 → ADMIN 라우팅 동작
5. US4 페이지 추가 → 404 + 공개 경로 완성

---

## Notes

- [P] = 다른 파일, 완료되지 않은 태스크에 비의존 → 병렬 실행 안전
- [Story] = spec.md user story 추적용 레이블
- Phase 2의 Sidebar import는 직접 경로 사용 (barrel export 이전) → T014에서 업데이트
- `auth.mock.ts`의 role/isLoading 값 변경으로 quickstart.md 시나리오 수동 검증
- `main.tsx` 수정 시 기존 `./index.css` import 경로 유지 필수 (경로 변경 금지)
- `router.tsx`의 JSX: `tsconfig.app.json`에 `"jsx": "react-jsx"` 설정됨 → React import 불필요
