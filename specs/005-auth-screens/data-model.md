# Data Model: 005 인증 화면

**Date**: 2026-06-15 | **Branch**: `005-auth-screens`

---

## Entities (from `generated/api-types.ts`)

### AccountSummary
authStore의 `user` 필드. `/api/v1/me` 및 로그인·가입 응답에서 수신.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `string` (uuid) | 계정 고유 식별자 |
| `email` | `string \| null` | 소셜 전용 계정은 null 가능 |
| `role` | `"USER" \| "ADMIN"` | 역할 |
| `emailVerified` | `boolean` | 이메일 인증 여부 |
| `onboardingCompleted` | `boolean` | 온보딩 완료 여부 |
| `signupType` | `"EMAIL" \| "SOCIAL"` | 가입 방식 |
| `createdAt` | `string` (ISO 8601) | 가입 시각 |
| `requiresReConsent` | `boolean` | 미동의 약관 존재 여부 |

### TermsVersion
가입·재동의 화면에서 사용. `GET /api/v1/terms` 로 조회.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `string` (uuid) | 약관 버전 식별자 |
| `type` | `"SERVICE" \| "PRIVACY" \| "MARKETING"` | 약관 종류 |
| `version` | `string` | 예: `"1.0"`, `"2.0"` |
| `effectiveDate` | `string` (date) | 시행일 |
| `isRequired` | `boolean` | 필수 약관 여부 |
| `isActive` | `boolean` | 현재 활성 여부 |

> 주의: 약관 전문(HTML/텍스트)은 이 엔티티에 없음. 별도 API 필요 (B-3-002).

### ConsentInput
가입·재동의·소셜 가입 완료 시 서버에 전송하는 동의 데이터.

| 필드 | 타입 | 설명 |
|---|---|---|
| `termsVersionId` | `string` (uuid) | 동의 대상 약관 버전 ID |
| `agreed` | `boolean` | 동의 여부 |

### ConsentRecord
`GET /api/v1/me/consents` 로 조회. 재동의 화면에서 현재 동의 상태 확인용.

| 필드 | 타입 | 설명 |
|---|---|---|
| `termsVersionId` | `string` (uuid) | 약관 버전 ID |
| `type` | `"SERVICE" \| "PRIVACY" \| "MARKETING"` | 약관 종류 |
| `version` | `string` | 약관 버전 |
| `agreed` | `boolean` | 동의 여부 |
| `agreedAt` | `string` (ISO 8601) | 동의 시각 |

### SocialPendingSignupResponse
소셜 콜백 202 응답. SocialCallbackPage → SocialConsentPage router state로 전달.

| 필드 | 타입 | 설명 |
|---|---|---|
| `isNew` | `boolean` | 항상 `true` (202에서만 사용) |
| `pendingToken` | `string` (JWT, TTL 10분) | 소셜 신원 토큰. `/complete`에서 소비. |
| `requiredTerms` | `TermsVersion[]` | 동의받아야 할 활성 약관 목록 |

### TokenPair
로그인·가입·소셜 완료 후 authStore에 저장.

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | `string` (JWT, TTL 1h) | 메모리 저장 |
| `refreshToken` | `string` (JWT, TTL 30d) | localStorage 저장 (`tokenStorage.ts`) |

---

## 클라이언트 전용 상태 (생성 없음, 설명만)

### 소셜 대기 토큰 (pendingToken) — 메모리 전용
- 위치: React Router navigate state
- 수명: SocialConsentPage 마운트 ~ `/complete` 호출 성공까지 (새로고침 시 소실)
- 저장 금지: localStorage, sessionStorage, Zustand

### OAuth provider 식별자 — sessionStorage 임시
- 키: `oauth_provider`
- 값: `"kakao" | "google" | "apple"`
- 수명: 소셜 버튼 클릭 ~ SocialCallbackPage 처리 완료까지
- 처리 후 즉시 삭제 (`sessionStorage.removeItem('oauth_provider')`)

---

## 상태 기계

### 이메일 가입 흐름
```
[RegisterPage] 폼 입력·검증
    → [submit] POST /api/v1/auth/signup
        ↓ 201
    → navigate('/verify-email')
    → [VerifyEmailPage] 6자리 코드 입력
        → POST /api/v1/auth/email-verification/verify
            ↓ 200 { emailVerified: true }
        → authStore.setAuth 갱신 (emailVerified=true)
        → GateRoute → /onboarding
```

### 소셜 가입 흐름 (pending-token A+(a))
```
[LoginPage] 소셜 버튼 클릭
    → sessionStorage.set('oauth_provider', provider)
    → GET /api/v1/auth/social/{provider}/authorize?redirectUri=/oauth/callback
        ↓ 200 { authorizeUrl }
    → window.location.href = authorizeUrl
    → [제공자 인증 페이지]
    → 제공자가 /oauth/callback?code=...&state=... 로 리다이렉트
    → [SocialCallbackPage] sessionStorage에서 provider 읽기
        → POST /api/v1/auth/social/{provider}/callback
            ↓ 200 { isNew: false, account, tokens }
            → setAuth() → GateRoute 진입
            ↓ 202 { isNew: true, pendingToken, requiredTerms }
            → navigate('/social-consent', { state: { pendingToken, provider, requiredTerms } })
    → [SocialConsentPage] 약관 동의
        → POST /api/v1/auth/social/complete
            ↓ 201 { account, tokens }
        → setAuth() → GateRoute 진입
```

### 비밀번호 재설정 3단계
```
Step 1: 이메일 입력
    → POST /api/v1/auth/password-reset/request
        ↓ 202
    → Step 2로 전환
Step 2: 코드 입력
    → POST /api/v1/auth/password-reset/verify
        ↓ 200 { resetToken }
    → resetToken 메모리 보관 → Step 3으로 전환
Step 3: 새 비밀번호 설정
    → POST /api/v1/auth/password-reset/confirm(resetToken, newPassword)
        ↓ 204
    → navigate('/login')
```

### 약관 재동의 흐름
```
[004 GateRoute] user.requiresReConsent=true
    → navigate('/re-consent')
[ReConsentPage]
    → GET /api/v1/terms (활성 약관 목록)
    → GET /api/v1/me/consents (현재 동의 상태)
    → 미동의 필수 약관 표시
    → POST /api/v1/me/consents(consents)
        ↓ 200
    → getMe() 재조회 or user.requiresReConsent=false 갱신
    → GateRoute 재진입 → 다음 게이트 또는 홈
```

---

## 검증 규칙 (클라이언트)

| 필드 | 규칙 | 오류 메시지 |
|---|---|---|
| 이메일 | RFC 5322 형식 | "올바른 이메일 형식이 아닙니다." |
| 비밀번호 | 최소 8자, 영문 1자 이상, 숫자 1자 이상 | "비밀번호는 영문·숫자를 포함해 8자 이상이어야 합니다." |
| 비밀번호 확인 | 비밀번호와 일치 | "비밀번호가 일치하지 않습니다." |
| 필수 약관 | 모두 `agreed=true` | 미동의 항목 강조 표시 |
| 만 14세 이상 | `ageConfirmed=true` | "만 14세 이상 동의가 필요합니다." |
| 6자리 코드 | `/^\d{6}$/` | "6자리 숫자를 입력해주세요." |
