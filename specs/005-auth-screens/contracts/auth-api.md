# Auth API Contract: 005 인증 화면

**Date**: 2026-06-15
**Source**: `generated/api-types.ts` (openapi.yaml 자동 생성, 수정 금지)
**구현 위치**: `src/lib/api/auth.ts`, `src/lib/api/terms.ts`

---

## auth.ts — 신규 추가 함수

### `signup()`
```
POST /api/v1/auth/signup
Request:  SignupRequest { email, password, consents: ConsentInput[], ageConfirmed: boolean }
Response: 201 { account: AccountSummary, tokens: TokenPair }
Errors:   409 이메일 중복 | 422 비밀번호 규칙·약관 미동의
Used by:  RegisterPage
```

### `requestEmailVerification()`
```
POST /api/v1/auth/email-verification/request
Request:  EmailVerificationRequestBody { email }
Response: 200 (no body)
Errors:   429 재전송 횟수 초과
Used by:  VerifyEmailPage (재발송 버튼)
```

### `verifyEmail()`
```
POST /api/v1/auth/email-verification/verify
Request:  EmailVerificationVerifyRequest { code }
Response: 200 { emailVerified?: boolean }
Errors:   400 코드 불일치 | 422 만료
Used by:  VerifyEmailPage
```

### `requestPasswordReset()`
```
POST /api/v1/auth/password-reset/request
Request:  PasswordResetRequestBody { email }
Response: 202 (no body — 이메일 존재 여부 노출 안함)
Errors:   429 재전송 횟수 초과 | 503 이메일 서비스 장애
Used by:  ForgotPasswordPage (Step 1)
```

### `verifyPasswordResetCode()`
```
POST /api/v1/auth/password-reset/verify
Request:  PasswordResetVerifyRequest { email, code }
Response: 200 { resetToken: string }
Errors:   400 코드 불일치 | 422 만료
Used by:  ForgotPasswordPage (Step 2)
```

### `confirmPasswordReset()`
```
POST /api/v1/auth/password-reset/confirm
Request:  PasswordResetConfirmRequest { resetToken, newPassword }
Response: 204 (no body)
Errors:   400 resetToken 만료·불일치 | 422 비밀번호 규칙 위반
Used by:  ForgotPasswordPage (Step 3)
```

### `getSocialAuthorizeUrl()`
```
GET /api/v1/auth/social/{provider}/authorize?redirectUri=/oauth/callback
Path:     provider: "kakao" | "google" | "apple"
Response: 200 { authorizeUrl: string }
Errors:   400 지원하지 않는 provider
Used by:  SocialButtons (버튼 클릭 시)
Note:     성공 즉시 window.location.href = authorizeUrl
```

### `handleSocialCallback()`
```
POST /api/v1/auth/social/{provider}/callback
Path:     provider: "kakao" | "google" | "apple"
Request:  SocialCallbackRequest { code, state, redirectUri, userJson? }
Response:
  200: { isNew: false, account: AccountSummary, tokens: TokenPair }  — 기존 회원 로그인 완료
  202: SocialPendingSignupResponse { isNew: true, pendingToken, requiredTerms }  — 신규, 약관 동의 필요
Errors:   400 state 불일치(CSRF) | 409 이메일 충돌
Used by:  SocialCallbackPage
```

### `completeSocialSignup()`
```
POST /api/v1/auth/social/complete
Request:  SocialCompleteRequest { pendingToken, consents: ConsentInput[], ageConfirmed: boolean }
Response: 201 { account: AccountSummary, tokens: TokenPair }
Errors:   400 pendingToken 만료·서명 오류 | 409 이메일 충돌(경합) | 422 필수 약관 미동의·연령 미확인
Used by:  SocialConsentPage
```

---

## terms.ts — 신규 파일

### `getActiveTerms()`
```
GET /api/v1/terms
Auth:     불필요 (공개)
Response: 200 TermsVersion[]
Used by:  RegisterPage, SocialConsentPage, ReConsentPage
TanStack Query key: ['terms', 'active']
staleTime: 10분 (약관은 자주 바뀌지 않음)
```

### `getConsents()`
```
GET /api/v1/me/consents
Auth:     필요
Response: 200 ConsentRecord[]
Used by:  ReConsentPage
TanStack Query key: ['me', 'consents']
staleTime: 0 (재동의 화면 진입 시 항상 최신 상태 필요)
```

### `submitConsents()`
```
POST /api/v1/me/consents
Auth:     필요
Request:  { consents: ConsentInput[] }
Response: 200 ConsentRecord[]
Used by:  ReConsentPage
Mutation: invalidate ['me', 'consents'] + 로그인 사용자 갱신
```

---

## 기존 함수 (변경 없음)

| 함수 | 엔드포인트 | 사용 화면 |
|---|---|---|
| `login()` | POST /api/v1/auth/login | LoginPage |
| `logout()` | POST /api/v1/auth/logout | UserGnbLayout, AdminSidebarLayout |
| `refreshTokenApi()` | POST /api/v1/auth/refresh | client.ts interceptor |
| `getMe()` | GET /api/v1/me | 앱 부팅 시 silent refresh |

---

## 에러 처리 공통 패턴

```
// src/lib/api/errorMessages.ts
export function getAuthErrorMessage(status?: number): string
// 401 → "이메일 또는 비밀번호가 올바르지 않습니다."
// 409 → "이미 사용 중인 이메일입니다."
// 422 → "입력한 정보를 다시 확인해주세요."
// 429 → "잠시 후 다시 시도해주세요."
// 500+ → "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
// network → "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요."
```
