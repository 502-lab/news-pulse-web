# Data Model: 004 라우팅·인증 골격

> 모든 타입은 `/generated/api-types.ts`에서 openapi 자동생성된 것을 사용한다.
> 아래는 프론트엔드 상태 모델로, API 응답 타입의 별칭이거나 파생 뷰다.

---

## 1. API 응답 스키마 (openapi 기준)

### AccountSummary (GET /me, POST /auth/login 공용)

```typescript
// /generated/api-types.ts에서 import
interface AccountSummary {
  id: string;                        // UUID
  email: string | null;              // 소셜 전용 계정은 null
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  onboardingCompleted: boolean;
  requiresReConsent: boolean;        // true → 재동의 화면으로 게이트
  signupType: 'EMAIL' | 'SOCIAL';
  createdAt: string;                 // ISO-8601 UTC
}
```

### TokenPair (POST /auth/login, POST /auth/refresh 응답)

```typescript
interface TokenPair {
  accessToken: string;    // JWT, TTL 1h. claim: sub=accountId, role, emailVerified
  refreshToken: string;  // 64자 hex, TTL 30d, Rotation 적용
  expiresIn: number;     // accessToken 만료까지 남은 초
}
```

---

## 2. 프론트엔드 상태 모델

### AuthUser — 인증 스토어의 사용자 뷰

`AccountSummary`를 그대로 쓴다. 별도 타입 정의 없음.

```typescript
type AuthUser = AccountSummary;  // /generated/api-types.ts 에서 import
```

### AuthStore — Zustand 스토어 형태

```typescript
interface AuthStore {
  // 상태
  user: AuthUser | null;          // null = 미인증
  accessToken: string | null;     // 메모리 only, persist 없음
  isLoading: boolean;             // true = 세션 복원 중 (부팅 시)

  // 액션
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}
```

### TokenStorage — localStorage 관리 유틸 (스토어 바깥)

```typescript
// src/lib/tokenStorage.ts
const REFRESH_KEY = 'rt';

interface TokenStorage {
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clearRefreshToken: () => void;
}
```

---

## 3. 접근 게이트 상태 전이

```
AuthUser 상태 조합 → 게이트 결과

requiresReConsent = true          → /re-consent
emailVerified = false             → /verify-email
onboardingCompleted = false       → /onboarding
role = 'USER'  + all pass         → /home
role = 'ADMIN' + all pass         → /admin
```

```
게이트 검사 우선순위 (위에서 아래 순서):
1. user === null                  → /login?returnTo=<현재경로>
2. requiresReConsent              → /re-consent
3. !emailVerified                 → /verify-email
4. !onboardingCompleted           → /onboarding
5. role === 'USER' + /admin 접근  → /home
```

---

## 4. 라우트 구조

```
/
├── (공개 — AuthShell)
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   ├── /verify-email          ← 슬롯 (게이트 목적지)
│   ├── /re-consent            ← 슬롯 (게이트 목적지)
│   ├── /terms
│   ├── /privacy
│   └── /* (404)
│
├── (USER 보호 — UserGnbLayout)
│   ├── /home                  ← USER 기본 홈 (WU01)
│   ├── /trends                (WU02)
│   ├── /bias                  (WU03)
│   ├── /articles/:id          (W04)
│   ├── /compare               (WU05 슬롯)
│   ├── /insights              (WU06 슬롯)
│   ├── /weekly                (WU07 슬롯)
│   └── /settings              ← 슬롯
│
└── (ADMIN 보호 — AdminSidebarLayout)
    ├── /admin                 ← ADMIN 기본 홈 (WA01)
    ├── /admin/ingestion       (WA02)
    ├── /admin/content         (WA05)
    ├── /admin/users           (W07)
    └── /admin/notice          (WA04)
```

---

## 5. Axios 인터셉터 상태 머신

```
API 요청 발생
    │
    ▼
Request 인터셉터
    └─ accessToken 있으면 Authorization: Bearer 헤더 추가
    │
    ▼
Response 인터셉터
    ├─ 2xx → 그대로 반환
    └─ 401 → 갱신 큐 진입
             ├─ isRefreshing=true 이면 → Promise 큐에 추가 (대기)
             └─ isRefreshing=false 이면
                  ├─ isRefreshing=true 설정
                  ├─ POST /auth/refresh (refreshToken 사용)
                  │    ├─ 성공 → 새 accessToken 스토어 저장
                  │    │         새 refreshToken localStorage 교체
                  │    │         큐 드레인(resolve) → 원 요청 재시도
                  │    │         isRefreshing=false
                  │    └─ 실패 → 큐 드레인(reject)
                  │              clearAuth() + clearRefreshToken()
                  │              /login으로 강제 이동
                  │              isRefreshing=false
```
