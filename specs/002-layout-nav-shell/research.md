# Research: 레이아웃 & 네비게이션 셸

**Branch**: `002-layout-nav-shell` | **Date**: 2026-06-11

---

## R-01: react-router-dom 설치 상태

**Decision**: Task 002-01에서 `pnpm add react-router-dom` 실행 필요

**Rationale**: `package.json`에 `react-router-dom` 미포함. v6는 타입 내장 (`@types/react-router-dom` 별도 불필요).

**Alternatives considered**: Tanstack Router — 과도한 의존성 추가. 프로젝트 스택이 react-router-dom 기준이므로 스택 준수.

---

## R-02: Vite path alias 설정 누락

**Decision**: `vite.config.ts`에 `@/` alias 추가 필요. `tsconfig.app.json`에는 이미 설정됨.

**Rationale**: `tsconfig.app.json`에 `"@/*": ["./src/*"]` 존재하나, Vite 번들러는 `vite.config.ts`의 `resolve.alias`를 별도로 읽는다. 두 파일 모두 설정해야 TypeScript 타입 체크와 런타임 번들링 모두 동작한다.

```ts
// vite.config.ts — 추가할 내용
import path from 'path';
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}
```

**Alternatives considered**: 상대 경로만 사용 — 파일 이동 시 import 경로 전체 수정 필요. 거부.

---

## R-03: Icon 컴포넌트 — 누락 아이콘

**Decision**: `Icon.tsx`의 `LUCIDE_MAP`에 `LayoutDashboard`, `Loader2` 추가. nav 상수는 기존 lucide 이름 사용 가능하도록 키를 실제 lucide 컴포넌트 이름 기준으로 정규화.

**Rationale**: 현재 `Icon` 컴포넌트 `LUCIDE_MAP`의 키는 단축 소문자 (`trend`, `scale`, `activity`, `users`). 스펙에서 요구하는 아이콘 이름이 lucide 공식 이름과 일치하지 않는다:

| 스펙 요구 이름 | 현재 LUCIDE_MAP 키 | 매핑 결과 |
|---|---|---|
| `LayoutDashboard` | 없음 | ❌ 렌더 불가 |
| `TrendingUp` | `trend` | ❌ 키 불일치 |
| `Scale` | `scale` | ❌ 키 불일치 (대소문자) |
| `Activity` | `activity` | ❌ 키 불일치 (대소문자) |
| `Users` | `users` | ❌ 키 불일치 (대소문자) |
| `Loader2` | 없음 | ❌ 렌더 불가 |

**Resolution**:
1. `Icon.tsx`에 `LayoutDashboard`, `Loader2` lucide 아이콘 import 추가
2. `LUCIDE_MAP`에 lucide 공식 이름 키 추가 (기존 단축 키 유지 — 하위 호환성)

```ts
// Icon.tsx 추가 import
import { LayoutDashboard, Loader2, TrendingUp, Scale, Activity, Users, ... } from 'lucide-react';

// LUCIDE_MAP 추가 키 (기존 단축 키 유지)
LayoutDashboard: LayoutDashboard,
Loader2: Loader2,
TrendingUp: TrendingUp,    // 기존 'trend' 유지 + 새 키 추가
Scale: Scale,              // 기존 'scale' 유지 + 새 키 추가
Activity: Activity,        // 기존 'activity' 유지 + 새 키 추가
Users: Users,              // 기존 'users' 유지 + 새 키 추가
```

이렇게 하면 기존 사용처(단축 키)는 깨지지 않고, 002 신규 컴포넌트는 lucide 공식 이름을 직접 사용할 수 있다.

**Alternatives considered**:
- nav 상수를 단축 키로 작성 — Icon 컴포넌트 내부 구현을 외부 소비자가 알아야 함. 추상화 누출. 거부.
- Icon 컴포넌트를 lucide 직접 전달 방식으로 리팩토링 — 002 범위 초과. 거부.

---

## R-04: Tailwind CSS v4 설계 토큰 호환성

**Decision**: 모든 스펙의 Tailwind 클래스(`bg-navy`, `text-brand`, `rounded-btn` 등) 그대로 사용 가능. 추가 설정 불필요.

**Rationale**: `src/index.css`의 `@theme` 블록에 필요한 모든 토큰 정의 확인됨:
- `--color-navy` → `bg-navy` ✅
- `--color-canvas` → `bg-canvas` ✅
- `--color-brand` → `text-brand`, `bg-brand` ✅
- `--color-ink-400` → `text-ink-400` ✅
- `--radius-btn` → `rounded-btn` ✅
- `--color-ink` → `text-ink` ✅

Tailwind v4는 `tailwind.config.ts` 없이 CSS `@theme` 변수만으로 커스텀 토큰을 처리한다.

---

## R-05: mock 스토어 + re-export 패턴 타당성

**Decision**: `auth.mock.ts` + `auth.ts` re-export 패턴 적용. 007에서 Zustand 실제 구현으로 교체 시 `auth.ts` 파일 하나만 수정.

**Rationale**: 소비자(`ProtectedRoute`, `AdminRoute`, `Sidebar`)가 `@/store/auth`를 import — 실제 구현 교체 시 소비자 코드 변경 없음. 표준 facade 패턴.

**Interface contract** (007에서 준수해야 할 인터페이스):
```ts
export interface AuthUser { id: string; nickname: string; email: string; role: 'USER' | 'ADMIN'; }
export interface AuthStore { user: AuthUser | null; isLoading: boolean; logout: () => void; }
export function useAuthStore(): AuthStore;
```

---

## R-06: React Router v6 중첩 라우트 패턴

**Decision**: `createBrowserRouter` + 중첩 route + `<Outlet />` 패턴. `ProtectedRoute`와 `AppShell`을 별도 레이어로 분리.

**Rationale**:
- `ProtectedRoute` (인증 게이트) → `AppShell` (레이아웃 셸) → 각 페이지 컴포넌트
- 이 두 관심사를 하나의 컴포넌트에 합치면 테스트 어렵고 책임 혼재
- React Router v6의 표준 nested route 패턴

**Key gotcha**: `/` NavItem은 `end={true}` prop 필수.
- 없으면: `/trends` 방문 시 `NavLink`의 `isActive` 로직이 prefix 매칭으로 `/`도 활성 처리
- `end` prop은 정확히 해당 경로와 일치할 때만 `isActive=true`
