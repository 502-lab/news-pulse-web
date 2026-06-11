# Feature Specification: 레이아웃 & 네비게이션 셸

**Feature Branch**: `002-layout-nav-shell`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "002 레이아웃 & 네비게이션 셸 — 앱 전체를 감싸는 레이아웃 셸과 사이드바 네비게이션 구현. 인증 상태 및 role(USER/ADMIN)에 따라 라우팅 분기. 모든 보호 화면은 이 셸 안에서 렌더."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 인증된 사용자 앱 진입 (Priority: P1)

인증된 일반 사용자(USER role)가 앱에 접속하면, 사이드바 네비게이션과 콘텐츠 영역이 포함된 레이아웃 셸이 표시된다. 사용자는 사이드바의 메뉴 항목을 클릭해 각 페이지로 이동할 수 있다.

**Why this priority**: 앱의 모든 보호 화면 접근의 기반이 되는 가장 핵심 흐름. 이 셸 없이는 다른 어떤 기능도 동작하지 않는다.

**Independent Test**: 브라우저에서 `/` 접근 시 Sidebar와 DashboardPage placeholder가 렌더되면 독립 검증 가능.

**Acceptance Scenarios**:

1. **Given** 인증된 USER role 사용자가, **When** `/` 경로에 접근하면, **Then** 사이드바(로고+네비게이션+유저 정보)와 대시보드 플레이스홀더가 표시된다.
2. **Given** 사이드바가 렌더된 상태에서, **When** "트렌드 분석" 메뉴를 클릭하면, **Then** `/trends` 경로로 이동하고 해당 NavItem이 활성 스타일로 표시된다.
3. **Given** `/` NavItem이 있는 상태에서, **When** `/trends` 페이지에 있으면, **Then** "대시보드" NavItem의 활성 스타일이 해제된다.
4. **Given** 사이드바 유저 영역이 렌더된 상태에서, **When** 로그아웃 버튼을 클릭하면, **Then** logout 함수가 호출된다.

---

### User Story 2 - 비인증 사용자 리다이렉트 (Priority: P1)

비인증 사용자가 보호된 경로에 접근하면, 자동으로 로그인 페이지로 리다이렉트된다. 로그인 페이지는 사이드바 없이 단독 렌더된다.

**Why this priority**: 보안상 필수. 인증 없이 보호 화면에 접근 가능하면 앱 전체 보안 모델이 무너진다.

**Independent Test**: 로그인하지 않은 상태에서 `/` 접근 시 `/login`으로 리다이렉트되면 독립 검증 가능.

**Acceptance Scenarios**:

1. **Given** user가 null인 상태에서, **When** `/` 또는 임의의 보호 경로에 접근하면, **Then** `/login`으로 리다이렉트된다.
2. **Given** `/login` 경로에 접근하면, **Then** 사이드바 없이 LoginPage placeholder만 렌더된다.
3. **Given** 인증 상태 확인 중(isLoading=true), **When** 보호된 경로에 접근하면, **Then** FullPageSpinner만 렌더되고 사이드바는 표시되지 않는다.

---

### User Story 3 - ADMIN 전용 라우트 접근 제어 (Priority: P2)

ADMIN role 사용자는 시스템 모니터링 및 사용자 관리 페이지에 접근할 수 있다. USER role 사용자가 ADMIN 전용 경로에 접근하면 대시보드로 리다이렉트된다. ADMIN 사용자는 NAV_ADMIN 메뉴(일반 메뉴 + 관리자 메뉴)를 볼 수 있다.

**Why this priority**: ADMIN 기능은 중요하지만 P1 흐름(기본 인증/레이아웃)이 동작해야 테스트 가능하므로 P2.

**Independent Test**: role='ADMIN' mock으로 `/admin/monitor` 접근 시 MonitorPage placeholder와 관리자 nav 항목이 표시되면 독립 검증 가능.

**Acceptance Scenarios**:

1. **Given** USER role mock 상태에서, **When** `/admin/monitor`에 접근하면, **Then** `/`로 리다이렉트된다.
2. **Given** ADMIN role mock 상태에서, **When** `/admin/monitor`에 접근하면, **Then** MonitorPage placeholder와 NAV_ADMIN 전체 메뉴(5개 항목)가 표시된다.
3. **Given** ADMIN role mock 상태에서, **When** `/admin/users`에 접근하면, **Then** UsersPage placeholder가 표시된다.

---

### User Story 4 - 404 및 공개 경로 처리 (Priority: P3)

존재하지 않는 경로 접근 시 NotFoundPage가 표시된다(사이드바 없음). 약관, 개인정보처리방침 등 공개 경로는 사이드바 없이 단독 렌더된다.

**Why this priority**: UX상 중요하지만 핵심 기능 동작에 영향 없는 보조 흐름.

**Independent Test**: `/존재하지않는경로` 접근 시 NotFoundPage(404 텍스트, 홈으로 돌아가기 링크)가 렌더되면 독립 검증 가능.

**Acceptance Scenarios**:

1. **Given** 임의의 미정의 경로에 접근하면, **Then** NotFoundPage(404, 홈 링크)가 사이드바 없이 렌더된다.
2. **Given** `/terms` 또는 `/privacy` 접근 시, **Then** 해당 placeholder가 사이드바 없이 렌더된다.
3. **Given** NotFoundPage의 "홈으로 돌아가기" 링크 클릭 시, **Then** `/`로 이동한다.

---

### Edge Cases

- `isLoading=true`이면서 user가 null인 경우: FullPageSpinner 표시 (리다이렉트 없음)
- 새로고침 시 현재 경로(예: `/trends`) 유지 — BrowserRouter history 기반이므로 자동 동작
- ADMIN role 사용자가 `/`(대시보드)에 접근하면: AdminRoute 바깥 경로이므로 정상 접근 가능
- NavItem의 `/` 경로에 `end` prop 미적용 시: 모든 경로에서 "대시보드" NavItem이 활성 상태로 오염됨 → `end` prop 필수

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 시스템은 인증 상태(user, isLoading)에 따라 보호 경로 접근을 제어해야 한다.
- **FR-002**: 인증된 사용자는 AppShell(사이드바 + 콘텐츠 영역) 레이아웃 안에서 보호 화면에 접근할 수 있어야 한다.
- **FR-003**: 비인증 사용자가 보호 경로에 접근하면 자동으로 `/login`으로 리다이렉트되어야 한다.
- **FR-004**: 인증 확인 중(isLoading=true)에는 FullPageSpinner만 표시되어야 한다.
- **FR-005**: ADMIN role 사용자만 `/admin/*` 경로에 접근할 수 있어야 한다.
- **FR-006**: USER role 사용자가 `/admin/*` 경로에 접근하면 `/`로 리다이렉트되어야 한다.
- **FR-007**: 사이드바는 사용자 role에 따라 적절한 네비게이션 항목을 표시해야 한다 (USER: 3개, ADMIN: 5개).
- **FR-008**: 현재 경로와 일치하는 NavItem은 활성 스타일로 표시되어야 한다.
- **FR-009**: 공개 경로(`/login`, `/register`, `/forgot`, `/terms`, `/privacy`)는 사이드바 없이 단독 렌더되어야 한다.
- **FR-010**: 정의되지 않은 경로 접근 시 NotFoundPage가 사이드바 없이 렌더되어야 한다.
- **FR-011**: 사이드바 유저 영역에 닉네임과 로그아웃 버튼이 표시되어야 한다.
- **FR-012**: 새로고침 시 현재 경로가 유지되어야 한다.

### Key Entities

- **AuthUser**: 인증된 사용자 (id, nickname, email, role: 'USER' | 'ADMIN')
- **AuthStore**: 인증 상태 컨테이너 (user: AuthUser | null, isLoading: boolean, logout: () => void)
- **NavItemDef**: 네비게이션 항목 정의 (to: 경로, icon: 아이콘 이름, label: 표시 텍스트)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 인증된 사용자가 앱 진입 시 1초 이내에 레이아웃 셸과 초기 페이지가 표시된다.
- **SC-002**: 비인증 사용자의 보호 경로 접근 시 즉시(1회 렌더 이내) 로그인 페이지로 리다이렉트된다.
- **SC-003**: USER role 사용자의 `/admin/*` 접근 시 대시보드로 즉시 리다이렉트된다.
- **SC-004**: 네비게이션 항목 클릭 후 경로 이동이 100ms 이내에 완료된다.
- **SC-005**: 모든 네비게이션 항목이 키보드(Tab+Enter)만으로 접근 및 활성화 가능하다.
- **SC-006**: TypeScript strict mode에서 컴파일 에러가 0개이다.
- **SC-007**: 007 인증 구현 시 `src/store/auth.ts` 파일만 수정하면 모든 소비자 코드 변경 없이 교체 가능하다.

## Assumptions

- 001 산출물(`Icon` 컴포넌트, `navy`/`brand`/`canvas`/`ink`/`btn` 디자인 토큰)이 이미 구현되어 있다.
- `react-router-dom`이 미설치 시 `pnpm add react-router-dom`으로 설치한다.
- 002 단계에서 인증 로직(실제 JWT 검증, 토큰 갱신 등)은 구현하지 않는다 — mock store로 대체.
- 007 단계에서 `src/store/auth.mock.ts`를 삭제하고 `auth.ts`를 실제 Zustand store로 교체한다.
- 페이지 컴포넌트는 모두 플레이스홀더로, 실제 콘텐츠는 003~007 단계에서 구현된다.
- 다크모드 토글은 001에서 구현된 `uiStore`를 통해 관리되지만, 002 셸에서는 다크모드 관련 UI 제어 로직은 구현하지 않는다.
- `spark2` 아이콘은 001의 `Icon` 컴포넌트를 통해 렌더된다.
