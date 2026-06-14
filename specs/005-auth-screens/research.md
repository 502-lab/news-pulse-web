# Research: 005 인증 화면

**Date**: 2026-06-15 | **Branch**: `005-auth-screens`

---

## R-001: Apple form_post SPA 수신 방식

**Decision**: 백엔드가 Apple POST 콜백을 받아 GET redirect로 SPA에 중계한다.

**Rationale**: SPA(Vite 정적 번들)는 HTTP POST를 직접 수신할 수 없다. Apple `Sign In with Apple`은 `response_mode=form_post`를 사용해 `code`, `state`, `user`(초회만)를 POST body로 `redirect_uri`에 전달한다. 백엔드가 이 POST를 받아 `/oauth/callback?code=...&state=...&userJson=...` 형태의 GET redirect로 SPA에 전달하는 relay 방식이 표준.

**Status**: 백엔드 구현 여부 미확인 → **B-3 이슈 등록 필요**. 미구현 시 Apple 소셜 버튼 비활성 + `// TODO(#이슈번호): Apple form_post relay 백엔드 미구현` 주석.

**Alternatives considered**:
- meta-refresh HTML page: 백엔드 서버 렌더 없이는 불가
- Apple JS SDK: 팝업 방식 가능하나 Apple 정책 제약 있음, 현재 계약에 없음
- iframe bridge: 보안 정책(COOP/COEP)으로 막힘

---

## R-002: OAuth callback provider 식별

**Decision**: 소셜 버튼 클릭 시 `sessionStorage.setItem('oauth_provider', provider)`. 콜백 페이지에서 읽고 즉시 삭제.

**Rationale**:
- `redirectUri`에 `?provider=kakao` 포함 방식: provider 포털에 등록된 정확한 URL과 불일치 위험.
- sessionStorage: 탭 단위 격리 → 다중 탭에서 provider 혼동 방지. 브라우저 리다이렉트(같은 탭) 후에도 유지됨.

**Alternatives considered**:
- URL hash (`#provider=kakao`): provider가 리다이렉트 시 hash 제거하는 경우 있음
- localStorage: 탭 간 공유 → 다중 탭에서 provider 충돌 가능

---

## R-003: pendingToken 전달 (SocialCallbackPage → SocialConsentPage)

**Decision**: `navigate('/social-consent', { state: { pendingToken, provider, requiredTerms }, replace: true })`

**Rationale**:
- React Router state는 브라우저 히스토리 스택에 연결되어 메모리에만 존재.
- 새로고침 시 소실 → spec 의도와 정확히 일치 (소셜 로그인 재시도 유도).
- `replace: true` → 히스토리 스택에서 콜백 페이지를 대체해 뒤로가기 방지.
- SocialConsentPage에서 `useLocation().state` 미존재 시 `/login`으로 navigate.

**pendingToken 절대 저장 금지 위치**: localStorage, sessionStorage, Zustand(영속화 없이도 state 외에 불필요)

**Alternatives considered**:
- Zustand 전역 슬라이스: 가능하나 컴포넌트 unmount 이후 stale state 정리 필요, 불필요한 전역 복잡성
- URL 쿼리 파라미터: 브라우저 히스토리·로그에 토큰 노출 위험

---

## R-004: returnTo 복귀 (로그인 후)

**Decision**: `useLocation().state?.returnTo`를 읽어 `navigate(returnTo || roleHome, { replace: true })`.

**Rationale**: 004에서 ProtectedRoute/GateRoute가 `navigate('/login', { state: { returnTo: pathname } })`로 전달하는 구조가 완성됨. LoginPage에서 `setAuth()` 후 바로 navigate.

**roleHome 결정**:
```
user.role === 'ADMIN' ? '/admin' : '/home'
```
이후 GateRoute가 emailVerified/onboardingCompleted 분기 처리 → 005는 gate 로직 재구현 금지.

---

## R-005: 폼 상태 관리

**Decision**: React `useState` + 인라인 검증 함수. 외부 폼 라이브러리 없음.

**Rationale**: CLAUDE.md 코딩 규칙. 각 폼 필드가 2~4개로 적어 react-hook-form 오버엔지니어링.

**검증 트리거**:
- 제출 시: 전체 필드 일괄 검증
- 필드 blur 시: 해당 필드만 검증
- 입력 중: 오류가 이미 표시된 경우에만 실시간 재검증

**검증 함수 위치**: 폼 컴포넌트 파일 상단 (export 없음, 내부 유틸)

---

## R-006: API 에러 → 한국어 메시지

**Decision**: `src/lib/api/errorMessages.ts`에 상태코드·에러코드별 메시지 맵. 각 폼 컴포넌트의 catch 블록에서 참조.

**구조**:
```ts
// src/lib/api/errorMessages.ts
export const AUTH_ERROR_MESSAGES: Record<number, string> = {
  401: '이메일 또는 비밀번호가 올바르지 않습니다.',
  409: '이미 사용 중인 이메일입니다.',
  422: '입력한 정보를 다시 확인해주세요.',
  500: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};
export const NETWORK_ERROR_MESSAGE = '네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.';
export function getAuthErrorMessage(status?: number): string { ... }
```

**Rationale**: 같은 401도 컨텍스트마다 다른 메시지가 필요하므로 interceptor가 아닌 호출부에서 처리.

---

## R-007: 약관 전문 콘텐츠

**Decision**: `~/Downloads/Newsift_screens/screens3.jsx`의 LEGAL 객체에 이용약관·개인정보처리방침 전문이 정적으로 포함되어 있다. 이 텍스트를 `src/constants/legalText.ts`로 이관해 TermsPage/PrivacyPage에서 렌더한다.

텍스트 이관은 디자인 소스의 콘텐츠만 추출하는 것으로, CLAUDE.md A-5 "프로토타입 코드 복사 금지"에 해당하지 않는다. 명시 동의(A) 방식을 택한 이상, 동의 화면의 "약관 보기"가 실제 읽을 수 있는 내용을 보여줘야 법적 동의가 성립한다.

**Status**: 정적 텍스트로 우선 구현. B-3-002는 "버전 관리 및 다국어 지원을 위한 백엔드 API 이관" 추적용으로 유지. 현재 TermsPage/PrivacyPage 동작은 정상(블로커 아님).

---

## R-008: ConsentList 공유 컴포넌트 설계

**Decision**: `ConsentList`는 `TermsVersion[]`을 props로 받아 체크박스를 렌더. 부모가 `getActiveTerms()` 를 호출하고 결과를 내려준다.

**TermRow 내 만 14세 항목**: `TermsVersion` 타입에 `type: "SERVICE" | "PRIVACY" | "MARKETING"`만 있고 `AGE_CONFIRM` 타입은 없음. → 만 14세 체크박스는 ConsentList 내 고정 항목(서버 약관과 별개의 클라이언트 필드)으로 처리. `ageConfirmed: boolean` 상태를 별도 관리.

**부모 콜백**: `onChange(consents: ConsentInput[], ageConfirmed: boolean)`

**Rationale**: SocialConsentPage도 동일 ConsentList를 재사용. `requiredTerms`(콜백 202 응답)를 props로 전달 가능.

---

## R-009: SocialCallbackPage 로딩 패턴

**Decision**: 페이지 마운트 즉시 `useEffect`에서 `handleSocialCallback()` 호출. 처리 중 전체 화면 스피너 표시. 오류 시 오류 메시지 + "다시 시도" 링크(`/login`).

**Rationale**: 콜백 URL은 사용자가 직접 입력하지 않으며, 마운트 즉시 1회 처리하는 단순한 패턴이 적절.

**중복 호출 방지**: `useRef(false)` → `called.current` 플래그로 StrictMode 이중 호출 방지.

---

## R-010: 이메일 인증 후 user 상태 갱신

**Decision**: `verifyEmail()` 성공 응답에 `emailVerified: boolean` 포함 여부 확인 → 포함이면 즉시 authStore 갱신. 미포함이면 `getMe()` 재호출 후 `setAuth()`.

**확인**: `emailVerificationVerify` 응답(타입 기준):
```ts
200: { content: { "application/json": { emailVerified?: boolean } } }
```
→ `emailVerified` 가 응답에 포함됨. 직접 `setAuth({ ...user, emailVerified: true }, accessToken)` 업데이트.

---

## 미결 사항 (B-3 이슈 등록)

| ID | 내용 | 등록 위치 |
|---|---|---|
| B-3-001 | Apple form_post 백엔드 relay 미확인 → Apple 소셜 버튼 비활성 stub (블로커) | news-pulse-back |
| B-3-002 | 약관 전문 백엔드 API 이관 — 현재 정적 텍스트(`src/constants/legalText.ts`) 사용 (비블로커) | news-pulse-back |
