# Data Model: 레이아웃 & 네비게이션 셸

**Branch**: `002-layout-nav-shell` | **Date**: 2026-06-11

---

## Entities

### AuthUser

인증된 사용자를 나타내는 불변 값 객체. 007에서 실제 API 응답으로 교체됨.

| Field | Type | Constraints |
|-------|------|------------|
| id | string | non-empty |
| nickname | string | non-empty, UI에 표시됨 |
| email | string | email format |
| role | `'USER' \| 'ADMIN'` | 라우팅 분기 기준 |

### AuthStore

인증 상태 컨테이너. `useAuthStore()` 훅으로 소비.

| Field | Type | Description |
|-------|------|-------------|
| user | `AuthUser \| null` | null = 비인증 상태 |
| isLoading | boolean | 인증 확인 진행 중 (true → FullPageSpinner) |
| logout | `() => void` | 로그아웃 액션 |

**State transitions** (002 mock — 단방향):
```
initial → { user: AuthUser, isLoading: false }
```

**007 확장 예정 상태 (참고)**:
```
initial → { user: null, isLoading: true }
  → API 검증 완료 → { user: AuthUser, isLoading: false }
  → 로그아웃 → { user: null, isLoading: false }
  → 토큰 만료 → { user: null, isLoading: false } + redirect /login
```

### NavItemDef

사이드바 네비게이션 항목 정의. 런타임 변경 없는 정적 상수.

| Field | Type | Description |
|-------|------|-------------|
| to | string | React Router 경로 (예: `/`, `/trends`) |
| icon | string | `Icon` 컴포넌트에 전달할 lucide 아이콘 이름 |
| label | string | 사이드바에 표시될 한국어 레이블 |

**Derived collections** (role 기반):
- `NAV_USER`: 3개 항목 (`/`, `/trends`, `/bias`)
- `NAV_ADMIN`: 5개 항목 (`NAV_USER` + `/admin/monitor`, `/admin/users`)

---

## Validation Rules

- `AuthStore.user`가 null이면 `ProtectedRoute`는 `/login`으로 리다이렉트
- `AuthStore.isLoading`이 true이면 리다이렉트 보류 → `FullPageSpinner` 표시
- `AuthUser.role !== 'ADMIN'`이면 `AdminRoute`는 `/`로 리다이렉트
- `NavItemDef.icon` 값은 `Icon` 컴포넌트의 `LUCIDE_MAP`에 존재하는 키여야 함

---

## Interface Contract (007 교체 보장)

007에서 실제 구현으로 교체 시 아래 인터페이스를 반드시 준수해야 한다:

```ts
// src/store/auth.ts가 export해야 하는 것
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

export function useAuthStore(): AuthStore;
```
