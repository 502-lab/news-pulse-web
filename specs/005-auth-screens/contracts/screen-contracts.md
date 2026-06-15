# Screen Contracts: 005 인증 화면

**Date**: 2026-06-15
**Note**: 모든 페이지는 AuthShell(중앙 카드, max-w-[380px]) 내부에 렌더된다.

---

## 공유 컴포넌트

### `ConsentList`
```ts
interface ConsentListProps {
  terms: TermsVersion[];           // getActiveTerms() 또는 pendingToken 콜백의 requiredTerms
  onChange: (consents: ConsentInput[], ageConfirmed: boolean) => void;
  disabled?: boolean;              // 제출 중 비활성화
}
```
- 렌더: `SERVICE`[필수], `PRIVACY`[필수], `MARKETING`[선택], 만 14세 이상[필수 · 고정 클라이언트 항목]
- "모두 동의" 체크박스: 필수+선택 전체 토글. 개별 해제 시 연동 해제.
- `ageConfirmed` 는 서버 약관과 별개의 클라이언트 불린 상태.

### `SocialButtons`
```ts
interface SocialButtonsProps {
  disabled?: boolean;
}
```
- 카카오·Google·Apple 버튼 각각 렌더.
- 클릭 시: `getSocialAuthorizeUrl(provider)` → `window.location.href = authorizeUrl`
- Apple: B-3-001 이슈 해결 전까지 비활성(disabled) + `// TODO(#이슈번호)` 주석.

---

## 페이지 컴포넌트

### `LoginPage` (`/login`)
```
Route: GuestOnlyRoute > AuthShell > /login
Props: 없음 (읽기: useLocation().state.returnTo)
Navigation:
  - 로그인 성공 → navigate(returnTo || roleHome, { replace: true })
  - "회원가입" 링크 → /register
  - "비밀번호 찾기" 링크 → /forgot-password
```
구성: `LoginForm` + `SocialButtons` + 묵시 약관 문구 + 네비게이션 링크

### `RegisterPage` (`/register`)
```
Route: GuestOnlyRoute > AuthShell > /register
Props: 없음
Navigation:
  - 가입 성공 → navigate('/verify-email', { replace: true })
  - "로그인" 링크 → /login
```
구성: `RegisterForm` (내부에 `ConsentList` 포함)

### `SocialCallbackPage` (`/oauth/callback`)
```
Route: AuthShell > /oauth/callback (GuestOnly 밖 — 소셜 계정 연결 확장 고려)
Props: 없음
읽기:
  - URL search params: code, state (kakao/google) or form-post relay
  - sessionStorage: oauth_provider
Guard: sessionStorage에 oauth_provider 없으면 navigate('/login', { replace: true })
        (직접 URL 진입, 탭 복사, sessionStorage 소실 등 비정상 진입 방어)
Navigation:
  - 200 → setAuth() + navigate(returnTo || roleHome, { replace: true })
  - 202 → navigate('/social-consent', { state: { pendingToken, provider, requiredTerms }, replace: true })
  - 오류 → 오류 메시지 + /login 링크
```
구성: FullPageSpinner (처리 중) | 오류 상태 (처리 실패)

### `SocialConsentPage` (`/social-consent`)
```
Route: AuthShell > /social-consent (GuestOnly 밖)
Props: 없음
읽기: useLocation().state → { pendingToken, provider, requiredTerms }
Guard: state 없으면 navigate('/login', { replace: true })
Navigation:
  - 가입 완료 → setAuth() + navigate(roleHome, { replace: true })
  - 오류 → 오류 메시지 (pendingToken 만료이면 /login 유도)
```
구성: 제공자 안내 문구 + `ConsentList`(requiredTerms 전달) + "가입 완료" 버튼

### `VerifyEmailPage` (`/verify-email`)
```
Route: ProtectedRoute > /verify-email (GateRoute 밖)
Props: 없음
읽기: authStore.user.email (재발송 시 필요)
Navigation:
  - 인증 성공 → authStore.setAuth 갱신 → GateRoute가 onboarding 또는 home으로 이동
```
구성: `EmailVerifyForm` (코드 입력 + 재발송 버튼)

### `ForgotPasswordPage` (`/forgot-password`)
```
Route: GuestOnlyRoute > AuthShell > /forgot-password
Props: 없음
Navigation:
  - 재설정 완료(Step 3 성공) → navigate('/login')
  - "로그인으로" 링크 → /login
```
구성: `PasswordResetForm` (step 1/2/3 내부 상태 관리)

### `ReConsentPage` (`/re-consent`)
```
Route: ProtectedRoute > /re-consent (GateRoute 밖)
Props: 없음
읽기: useQuery(['terms', 'active']), useQuery(['me', 'consents'])
Navigation:
  - 재동의 성공 → user 갱신(requiresReConsent=false) → GateRoute 재진입
  - 거부/이탈 → logout() → /login
```
구성: 변경 약관 목록 (ConsentList 또는 간소화된 버전) + "동의" 버튼 + "거부" 버튼

### `TermsPage` (`/terms`)
```
Route: AuthShell > /terms (공개, 인증 불필요)
Props: 없음
Navigation: 없음 (뒤로가기만)
```
구성: `legalText.SERVICE` 정적 텍스트 (스크롤 가능 영역) + `// TODO(#B-3-002): 백엔드 API 이관`

### `PrivacyPage` (`/privacy`)
```
Route: AuthShell > /privacy (공개, 인증 불필요)
Props: 없음
Navigation: 없음 (뒤로가기만)
```
구성: `legalText.PRIVACY` 정적 텍스트 (동일 패턴) + `// TODO(#B-3-002): 백엔드 API 이관`

---

## router.tsx 변경 사항

추가 라우트 2개:
```tsx
// AuthShell 안, GuestOnly 밖 (기존 공개-AuthShell 그룹에 추가)
{ path: '/oauth/callback', element: socialCallbackPage },
{ path: '/social-consent', element: socialConsentPage },
```

추가 lazyPage 2개:
```tsx
const socialCallbackPage = lazyPage(() => import('@/pages/auth/SocialCallbackPage'));
const socialConsentPage = lazyPage(() => import('@/pages/auth/SocialConsentPage'));
```
