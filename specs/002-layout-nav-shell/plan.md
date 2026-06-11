# Implementation Plan: 레이아웃 & 네비게이션 셸

**Branch**: `002-layout-nav-shell` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-layout-nav-shell/spec.md`

## Summary

앱 전체 레이아웃 셸(AppShell + Sidebar)과 역할 기반 라우팅(ProtectedRoute/AdminRoute)을 구현한다.
React Router v6 `createBrowserRouter` 기반 라우트 트리를 구성하고, 인증 상태는 mock store로 제공한다.
007 단계에서 실제 Zustand 인증 스토어로 교체할 때 `src/store/auth.ts` 파일 하나만 수정하면 되도록 re-export 패턴을 적용한다.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.2.6

**Primary Dependencies**: Vite 8, React Router DOM v6 (미설치 → Task 002-01에서 설치), lucide-react 1.17, Tailwind CSS v4

**Storage**: N/A (클라이언트 상태 — mock)

**Testing**: 현재 테스트 프레임워크 미구성 (002 범위 외)

**Target Platform**: 웹 브라우저 (Chrome/Safari/Firefox 최신 2버전)

**Project Type**: SPA (Vite + React)

**Performance Goals**: 경로 이동 100ms 이내, 초기 셸 렌더 1초 이내

**Constraints**:
- `any` 타입 금지 (constitution Principle IV)
- 인라인 style 금지 (Tailwind CSS only)
- localStorage JWT 저장 금지 (constitution Principle — Authentication)
- ProtectedRoute/AdminRoute 필수 (constitution Principle II)

**Scale/Scope**: 13개 파일 신규 생성, 2개 기존 파일 수정

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Strict Architecture Boundary | ✅ PASS | 백엔드 API 호출 없음. mock 스토어는 인터페이스만 정의 |
| II. API Contract First | ✅ PASS | API 호출 없음 — 라우팅/레이아웃 전용 |
| III. Complete State Handling | ✅ PASS | ProtectedRoute가 isLoading/null/user 3개 상태 처리 |
| IV. Type Safety | ✅ PASS | AuthUser/AuthStore/NavItemDef 인터페이스 명시. any 금지 |
| V. Accessibility by Default | ✅ PASS | `<nav>`, `<main>` 시맨틱 태그 사용. NavLink 키보드 접근 가능 |
| Auth — JWT Storage | ✅ PASS | 002는 mock 스토어. 실제 토큰 저장 없음 |
| Auth — ProtectedRoute/AdminRoute | ✅ PASS | 라우트 트리에 적용 |
| Performance — Code Splitting | ⚠️ DEFERRED | React.lazy 적용은 페이지 구현(003~007) 시점에 수행. 플레이스홀더 단계는 제외 |

**Post-design re-check**: Phase 1 설계 후 재검토 필요 없음 — 신규 API 없음, 데이터 모델 없음.

## Project Structure

### Documentation (this feature)

```text
specs/002-layout-nav-shell/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit-tasks 출력 (이 명령에서 생성 안 함)
```

### Source Code (repository root)

```text
src/
├── main.tsx                          ← 수정: RouterProvider 연결
├── router.tsx                        ← 신규: 전체 라우트 트리
├── store/
│   ├── auth.mock.ts                  ← 신규: 002 전용 mock
│   └── auth.ts                       ← 신규: re-export 진입점
├── layouts/
│   └── AppShell.tsx                  ← 신규
├── components/
│   ├── ui/
│   │   └── Icon.tsx                  ← 수정: LayoutDashboard, Loader2 추가
│   └── nav/
│       ├── Sidebar.tsx               ← 신규
│       ├── NavItem.tsx               ← 신규
│       ├── ProtectedRoute.tsx        ← 신규
│       ├── AdminRoute.tsx            ← 신규
│       └── index.ts                  ← 신규: barrel export
├── components/common/
│   └── FullPageSpinner.tsx           ← 신규
├── constants/
│   └── nav.ts                        ← 신규
└── pages/
    ├── DashboardPage.tsx             ← 신규 (placeholder)
    ├── TrendsPage.tsx                ← 신규 (placeholder)
    ├── BiasPage.tsx                  ← 신규 (placeholder)
    ├── ArticleDetailPage.tsx         ← 신규 (placeholder)
    ├── NotFoundPage.tsx              ← 신규
    ├── admin/
    │   ├── MonitorPage.tsx           ← 신규 (placeholder)
    │   └── UsersPage.tsx             ← 신규 (placeholder)
    ├── auth/
    │   ├── LoginPage.tsx             ← 신규 (placeholder)
    │   ├── RegisterPage.tsx          ← 신규 (placeholder)
    │   └── ForgotPage.tsx            ← 신규 (placeholder)
    └── legal/
        ├── TermsPage.tsx             ← 신규 (placeholder)
        └── PrivacyPage.tsx           ← 신규 (placeholder)
```

**Structure Decision**: SPA 단일 프로젝트 구조. 기존 `src/` 디렉토리 확장.

## Complexity Tracking

> 위반 없음 — 추가 항목 없음

---

## Task Breakdown

### 의존성 다이어그램

```
002-01 (패키지 설치 + alias 확인 + Icon 아이콘 추가)
  ├── 002-02 (auth 스토어 mock)
  │     └── 002-06 (Sidebar) ──────────────────────┐
  ├── 002-03 (nav 상수)                             │
  │     └── 002-05 (NavItem)                        │
  │           └── 002-06 (Sidebar) ─────────────────┤
  └── 002-04 (FullPageSpinner)                      │
        └── 002-07 (ProtectedRoute / AdminRoute)    │
                                                    ▼
                                          002-08 (AppShell)
                                                    │
                                          002-09 (barrel export)
                                                    │
                                          002-10 (페이지 플레이스홀더 11종)
                                                    │
                                          002-11 (NotFoundPage)
                                                    │
                                          002-12 (router.tsx)
                                                    │
                                          002-13 (main.tsx 수정 + 최종 검증)
```

---

### Task 002-01 · 패키지 설치 + path alias 확인 + Icon 누락 아이콘 추가

**파일:**
- `package.json`
- `vite.config.ts` — 기존 파일 수정
- `tsconfig.app.json` — 확인 (이미 `@/` alias 설정됨)
- `src/components/ui/Icon.tsx` — 기존 파일 수정 (LUCIDE_MAP 아이콘 추가)

#### react-router-dom 설치
- 설치 여부 확인 후 없으면 `pnpm add react-router-dom`
- `@types/react-router-dom` 별도 설치 불필요 (v6부터 타입 내장)

#### `@/` path alias 설정
`tsconfig.app.json`에 `"@/*": ["./src/*"]` 이미 존재. `vite.config.ts`에만 추가 필요.

```ts
// vite.config.ts
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/news-pulse-web/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Icon.tsx LUCIDE_MAP 누락 아이콘 추가

`src/components/ui/Icon.tsx`의 `LUCIDE_MAP`에 002에서 사용하는 아이콘 추가.

| 아이콘 이름 | 사용처 | 현재 상태 |
|------------|--------|----------|
| `LayoutDashboard` | NAV_USER 대시보드 | ❌ 없음 |
| `Loader2` | FullPageSpinner | ❌ 없음 |
| `TrendingUp` | NAV_USER 트렌드 분석 | ⚠️ `trend` 단축키만 존재 |
| `Scale` | NAV_USER 편향 분석 | ⚠️ `scale` 단축키만 존재 |
| `Activity` | NAV_ADMIN 시스템 모니터링 | ⚠️ `activity` 단축키만 존재 |
| `Users` | NAV_ADMIN 사용자 관리 | ⚠️ `users` 단축키만 존재 |

기존 단축 키 유지 + lucide 공식 이름 키 추가 (하위 호환성 보장):

```ts
// 추가할 import
import { LayoutDashboard, Loader2 } from 'lucide-react';
// TrendingUp, Scale, Activity, Users는 이미 import됨

// LUCIDE_MAP 추가 항목
LayoutDashboard: LayoutDashboard,
Loader2: Loader2,
TrendingUp: TrendingUp,   // 기존 'trend' 키 유지
Scale: Scale,             // 기존 'scale' 키 유지
Activity: Activity,       // 기존 'activity' 키 유지
Users: Users,             // 기존 'users' 키 유지
```

**완료 조건:**
- `pnpm install` 에러 없음
- `import { Icon } from '@/components/ui'` TypeScript 에러 없음
- `<Icon name="LayoutDashboard" />`, `<Icon name="Loader2" />` 렌더 에러 없음

---

### Task 002-02 · auth 스토어 mock 생성

**파일:**
- `src/store/auth.mock.ts` — 신규 생성
- `src/store/auth.ts` — 신규 생성 (re-export 진입점)

```ts
// src/store/auth.mock.ts
export interface AuthUser {
  id: string;
  nickname: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
}

// ADMIN 라우팅 테스트 시 role을 'ADMIN'으로 변경
export const useAuthStore = (): AuthStore => ({
  user: {
    id: '1',
    nickname: '테스트유저',
    email: 'test@example.com',
    role: 'USER',
  },
  isLoading: false,
  logout: () => console.log('[mock] logout'),
});
```

```ts
// src/store/auth.ts
// 사용처는 항상 이 파일에서 import.
// 007에서 실제 구현으로 교체 시 이 파일만 수정 — 사용처 import 경로 변경 불필요.
export { useAuthStore, type AuthUser, type AuthStore } from './auth.mock';
```

**완료 조건:**
- TypeScript 에러 없음
- `@/store/auth`에서 `useAuthStore`, `AuthUser`, `AuthStore` 접근 가능

---

### Task 002-03 · 네비게이션 링크 상수 생성

**파일:** `src/constants/nav.ts` — 신규 생성

```ts
export interface NavItemDef {
  to: string;
  icon: string;
  label: string;
}

export const NAV_USER: NavItemDef[] = [
  { to: '/',       icon: 'LayoutDashboard', label: '대시보드' },
  { to: '/trends', icon: 'TrendingUp',      label: '트렌드 분석' },
  { to: '/bias',   icon: 'Scale',           label: '편향 분석' },
];

export const NAV_ADMIN: NavItemDef[] = [
  ...NAV_USER,
  { to: '/admin/monitor', icon: 'Activity', label: '시스템 모니터링' },
  { to: '/admin/users',   icon: 'Users',    label: '사용자 관리' },
];
```

**완료 조건:** TypeScript 에러 없음, `NAV_ADMIN.length === 5`

---

### Task 002-04 · FullPageSpinner 생성

**파일:** `src/components/common/FullPageSpinner.tsx` — 신규 생성

```tsx
import { Icon } from '@/components/ui';

export default function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas">
      <Icon name="Loader2" size={32} className="animate-spin text-brand" />
    </div>
  );
}
```

**완료 조건:** TypeScript 에러 없음

---

### Task 002-05 · NavItem 컴포넌트 생성

**파일:** `src/components/nav/NavItem.tsx` — 신규 생성

```tsx
import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
}

export default function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        isActive
          ? 'flex items-center gap-3 px-3 py-2 rounded-btn text-sm transition-colors w-full bg-brand/20 text-brand font-medium'
          : 'flex items-center gap-3 px-3 py-2 rounded-btn text-sm transition-colors w-full text-ink-400 hover:text-white hover:bg-white/5'
      }
    >
      <Icon name={icon} size={18} />
      {label}
    </NavLink>
  );
}
```

**완료 조건:** TypeScript 에러 없음, `to === '/'`일 때만 `end` prop 활성

---

### Task 002-06 · Sidebar 컴포넌트 생성

**파일:** `src/components/nav/Sidebar.tsx` — 신규 생성

레이아웃:
```
h-screen w-[240px] bg-navy flex flex-col
├── 로고 영역: h-[64px] px-5 flex items-center gap-2 shrink-0
│   Icon(spark2, size=20, className="text-brand") + "NewsPulse"
├── nav 영역: flex-1 px-3 py-4 flex flex-col gap-1
│   role === 'ADMIN' ? NAV_ADMIN : NAV_USER → NavItem 렌더
└── 유저 영역: px-4 py-4 border-t border-white/10 shrink-0
    user !== null일 때만: 닉네임 + 로그아웃 버튼
```

**완료 조건:** TypeScript 에러 없음, `user === null`이면 유저 영역 렌더 안 함

---

### Task 002-07 · ProtectedRoute / AdminRoute 생성

**파일:**
- `src/components/nav/ProtectedRoute.tsx` — 신규
- `src/components/nav/AdminRoute.tsx` — 신규

ProtectedRoute 분기:
```
isLoading === true  → <FullPageSpinner />
user === null       → <Navigate to="/login" replace />
그 외               → <Outlet />
```

AdminRoute 분기:
```
user?.role === 'ADMIN'  → <Outlet />
그 외                   → <Navigate to="/" replace />
```

**완료 조건:** TypeScript 에러 없음, `user?.role` optional chaining 사용

---

### Task 002-08 · AppShell 생성

**파일:** `src/layouts/AppShell.tsx` — 신규 생성

```tsx
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/nav/Sidebar';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

**완료 조건:** TypeScript 에러 없음

---

### Task 002-09 · barrel export 생성

**파일:** `src/components/nav/index.ts` — 신규 생성

```ts
export { default as Sidebar } from './Sidebar';
export { default as NavItem } from './NavItem';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as AdminRoute } from './AdminRoute';
```

AppShell의 Sidebar import를 `@/components/nav/Sidebar` → `@/components/nav`로 업데이트.

**완료 조건:** TypeScript 에러 없음, 4개 컴포넌트 모두 접근 가능

---

### Task 002-10 · 페이지 플레이스홀더 11종 생성

**파일:** `src/pages/` 하위 신규 생성

| 파일 | 경로 | 안내 텍스트 |
|------|------|------------|
| DashboardPage.tsx | pages/ | 대시보드 — 003에서 구현 |
| TrendsPage.tsx | pages/ | 트렌드 분석 — 004에서 구현 |
| BiasPage.tsx | pages/ | 편향 분석 — 004에서 구현 |
| ArticleDetailPage.tsx | pages/ | 기사 상세 — 005에서 구현 |
| MonitorPage.tsx | pages/admin/ | 시스템 모니터링 — 006에서 구현 |
| UsersPage.tsx | pages/admin/ | 사용자 관리 — 006에서 구현 |
| LoginPage.tsx | pages/auth/ | 로그인 — 007에서 구현 |
| RegisterPage.tsx | pages/auth/ | 회원가입 — 007에서 구현 |
| ForgotPage.tsx | pages/auth/ | 비밀번호 찾기 — 007에서 구현 |
| TermsPage.tsx | pages/legal/ | 이용약관 — 007에서 구현 |
| PrivacyPage.tsx | pages/legal/ | 개인정보처리방침 — 007에서 구현 |

패턴:
```tsx
export default function XxxPage() {
  return (
    <div className="p-6">
      <p className="text-ink-400 text-sm">XXX — 00N에서 구현</p>
    </div>
  );
}
```

**완료 조건:** TypeScript 에러 없음, 11개 파일 모두 `default export` 존재

---

### Task 002-11 · NotFoundPage 생성

**파일:** `src/pages/NotFoundPage.tsx` — 신규 생성

```tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas">
      <p className="text-5xl font-bold text-ink">404</p>
      <p className="text-ink-400">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="text-brand hover:underline text-sm">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
```

**완료 조건:** TypeScript 에러 없음

---

### Task 002-12 · router.tsx 생성

**파일:** `src/router.tsx` — 신규 생성

```tsx
import { createBrowserRouter } from 'react-router-dom';
import AppShell from '@/layouts/AppShell';
import { ProtectedRoute, AdminRoute } from '@/components/nav';
import DashboardPage from '@/pages/DashboardPage';
import TrendsPage from '@/pages/TrendsPage';
import BiasPage from '@/pages/BiasPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';
import MonitorPage from '@/pages/admin/MonitorPage';
import UsersPage from '@/pages/admin/UsersPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPage from '@/pages/auth/ForgotPage';
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';

export const router = createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot',   element: <ForgotPage /> },
  { path: '/terms',    element: <TermsPage /> },
  { path: '/privacy',  element: <PrivacyPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true,          element: <DashboardPage /> },
          { path: 'trends',       element: <TrendsPage /> },
          { path: 'bias',         element: <BiasPage /> },
          { path: 'articles/:id', element: <ArticleDetailPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: 'admin/monitor', element: <MonitorPage /> },
              { path: 'admin/users',   element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
```

**완료 조건:** TypeScript 에러 없음, 모든 import 에러 없음

---

### Task 002-13 · main.tsx 수정 + 최종 검증

**파일:** `src/main.tsx` — 기존 파일 수정

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

**완료 조건 (quickstart.md S-01~S-08 시나리오 전체 통과):**
- `pnpm dev` TypeScript 에러 없음
- `/` → AppShell + Sidebar + DashboardPage placeholder
- `/login` → Sidebar 없이 LoginPage placeholder
- Sidebar 로고: spark2 아이콘 + "NewsPulse"
- NavItem 클릭 → 경로 이동 + 활성 스타일
- `/trends` 진입 시 `/` NavItem 비활성
- role=USER + `/admin/monitor` → `/` 리다이렉트
- role=ADMIN + `/admin/monitor` → NAV_ADMIN 5개 항목 + MonitorPage
- isLoading=true → FullPageSpinner
- 미정의 경로 → NotFoundPage (Sidebar 없음)
- 새로고침 → 현재 경로 유지
