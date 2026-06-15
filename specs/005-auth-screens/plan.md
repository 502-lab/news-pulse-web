# Implementation Plan: 005 인증 화면

**Branch**: `005-auth-screens` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-auth-screens/spec.md`

## Summary

004의 라우팅·인증 골격(AuthShell, authStore, 가드, returnTo, 토큰 라이프사이클) 위에 로그인·이메일 가입·소셜 가입·이메일 인증·비밀번호 재설정·약관 재동의·약관 열람 7개 화면을 구현한다. 모든 화면은 AuthShell(중앙 카드 max-w-[380px]) 안에 렌더되며, `~/Downloads/Newsift_screens/screens3.jsx` 디자인 프로토타입에서 레이아웃·토큰을 추출해 프로덕션 스택(React 19 / Router v7 / TS)으로 재구현한다. 소셜 흐름은 pending-token 방식(A+(a) 결정)으로 구현한다.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Vite 6

**Primary Dependencies**:
- React Router v7 — 라우팅 (already installed)
- TanStack Query v5 — 약관 목록 서버 상태 (already installed)
- Zustand — authStore (already installed)
- Axios + apiClient — HTTP (already installed)
- Tailwind CSS v4 (CSS-first, `@theme` in index.css) — 스타일 (already installed)
- Vitest + React Testing Library + MSW — 테스트 (already installed)

**Storage**:
- `accessToken`: authStore(메모리)
- `refreshToken`: localStorage (`tokenStorage.ts`)
- `pendingToken`: React Router navigate state (메모리, 새로고침 시 소실 — 의도된 동작)
- `oauth_provider`: sessionStorage (소셜 리다이렉트 전후 탭 내 임시 유지)

**Testing**: Vitest + RTL + MSW (handlers 추가)

**Target Platform**: Chrome / Safari / Firefox (최신 2 버전), SPA

**Project Type**: Web application (React SPA, frontend-only)

**Performance Goals**:
- SC-001: 로그인 응답 수신 → 화면 전환 ≤500ms
- SC-003: 오류 메시지 ≤3초

**Constraints**:
- `any` 타입 금지 — `/generated/api-types.ts` 타입만 사용
- 인라인 style 금지 — Tailwind only
- 폼 라이브러리 없음 — React useState + 인라인 검증
- 004 게이트 로직 재구현 금지 — login 후 navigate만, 게이트가 분기 처리
- Apple 소셜 form_post: 백엔드 relay 미확인 → 백엔드 B-3 이슈 등록, Apple 버튼 비활성 stub
- 약관 전문 콘텐츠 API 없음 → `~/Downloads/Newsift_screens/screens3.jsx` LEGAL 객체 텍스트를 `src/constants/legalText.ts`로 이관해 렌더 (텍스트 이관이므로 A-5 프로토타입 코드 복사 금지 위반 아님). B-3 이슈는 백엔드 API 이관 추적용으로 유지.

**Scale/Scope**: 7 User Story, 9 pages (+ SocialCallbackPage), 7 공유 컴포넌트

## Constitution Check

| 원칙 | 준수 여부 | 비고 |
|---|---|---|
| 완전한 상태 처리 (loading/error/empty) | ✅ 준수 | 모든 폼: 제출 중 버튼 비활성, 오류 메시지, 빈 입력 검증 |
| Type Safety (any 금지) | ✅ 준수 | generated/api-types.ts 스키마만 참조 |
| 접근성 (aria, keyboard) | ✅ 준수 | label 연결, Enter 제출, aria-invalid/aria-describedby |
| 인증 토큰 보관 (accessToken 메모리 / refreshToken localStorage) | ✅ 준수 | 004 기존 구현 사용 |
| pendingToken 메모리 전용 | ✅ 준수 | Router state로 전달, storage 비저장 |
| 코드 스플리팅 (React.lazy + Suspense) | ✅ 준수 | 004 lazyPage 헬퍼 재사용 |
| 컴포넌트 100줄 이하 | ✅ 준수 | 폼·컴포넌트 분리 설계 |
| API 타입: /generated/api-types.ts | ✅ 준수 | auth.ts 확장 시 동일 적용 |
| 백엔드 블로커 B-3 이슈 등록 | ✅ 준수 | Apple form_post relay(블로커), 약관 전문 API 이관(비블로커) |

## Project Structure

### Documentation (this feature)

```text
specs/005-auth-screens/
├── plan.md              ← this file
├── research.md          ← 기술 결정 및 미결사항
├── data-model.md        ← 엔티티·상태기계
├── quickstart.md        ← 검증 시나리오
├── contracts/
│   ├── auth-api.md      ← API 함수 계약
│   └── screen-contracts.md  ← 화면·컴포넌트 계약
└── checklists/
    └── requirements.md  ← spec 품질 체크리스트
```

### Source Code (신규·변경 파일)

```text
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx             ← US1 구현 (stub → real)
│   │   ├── RegisterPage.tsx          ← US2 구현 (stub → real)
│   │   ├── SocialCallbackPage.tsx    ← US3 신규 (OAuth 콜백 처리기)
│   │   ├── SocialConsentPage.tsx     ← US3 신규 (소셜 가입 약관 동의)
│   │   ├── VerifyEmailPage.tsx       ← US4 구현 (stub → real)
│   │   ├── ForgotPasswordPage.tsx    ← US5 구현 (stub → real)
│   │   └── ReConsentPage.tsx         ← US6 구현 (stub → real)
│   └── legal/
│       ├── TermsPage.tsx             ← US7 신규 (legalText.SERVICE 렌더)
│       └── PrivacyPage.tsx           ← US7 신규 (legalText.PRIVACY 렌더)
├── components/
│   └── features/
│       └── auth/
│           ├── ConsentList.tsx       ← 공유: 약관 체크박스 목록 + 모두동의
│           ├── SocialButtons.tsx     ← 공유: 소셜 로그인 버튼 3종
│           ├── LoginForm.tsx         ← US1 전용
│           ├── RegisterForm.tsx      ← US2 전용
│           ├── EmailVerifyForm.tsx   ← US4 전용
│           └── PasswordResetForm.tsx ← US5 전용 (3단계)
├── lib/
│   └── api/
│       ├── auth.ts                   ← 기존 확장 (signup, social, email-verify, pw-reset)
│       ├── terms.ts                  ← 신규 (getActiveTerms, getConsents, submitConsents)
│       └── errorMessages.ts         ← 신규 (HTTP 상태→한국어 메시지 맵)
├── constants/
│   └── legalText.ts                  ← US7 신규 (screens3.jsx LEGAL 텍스트 이관)
└── app/
    └── router.tsx                    ← /oauth/callback, /social-consent 라우트 추가
```

## Implementation Phases

### Phase 1 — P1 (이메일 로그인·가입·인증)

**US1: 이메일 로그인**
- `errorMessages.ts` 작성 (401, 422, 5xx, network error → 한국어)
- `auth.ts`에 `signup()` 추가 (login은 이미 있음)
- `LoginForm.tsx`: 이메일·비밀번호 필드, 클라이언트 검증, 제출 → `login()` → `setAuth()` → `navigate(returnTo || roleHome)`
- `SocialButtons.tsx`: 카카오·Google·Apple 버튼 (소셜 연동 준비 전까지 비활성 + TODO stub)
- `LoginPage.tsx`: LoginForm + SocialButtons + 묵시 약관 문구 + 가입·비밀번호찾기 링크

**US2: 이메일 회원가입**
- `terms.ts`에 `getActiveTerms()` 추가
- `ConsentList.tsx`: TermsVersion[] props → 서비스[필수]·개인정보[필수]·마케팅[선택]·만14세[필수] 체크박스 + 모두동의. 부모에 `onChange(consents, ageConfirmed)` 콜백.
- `RegisterForm.tsx`: 이메일·비밀번호·비밀번호확인 필드 + ConsentList → `signup()` → navigate to `/verify-email`
- `RegisterPage.tsx`: RegisterForm 렌더

**US4: 이메일 인증** ← Phase 1로 이동 (US2 가입 직후 dead-end 방지)
- `auth.ts`에 `requestEmailVerification()`, `verifyEmail()` 추가
- `EmailVerifyForm.tsx`: 6자리 코드 입력 → `verifyEmail()` → `setAuth()` 업데이트 후 004 게이트 통과, 재발송 버튼
- `VerifyEmailPage.tsx`: EmailVerifyForm 렌더

### Phase 2 — P2 (소셜·비번재설정·재동의)

**US3: 소셜 로그인·가입**
- `auth.ts`에 `getSocialAuthorizeUrl()`, `handleSocialCallback()`, `completeSocialSignup()` 추가
- `SocialCallbackPage.tsx`: sessionStorage에서 provider 읽기 → **미존재 시 navigate('/login', { replace: true }) (직접 URL 진입 방어)** → `handleSocialCallback()` → 200이면 `setAuth()` + navigate, 202이면 navigate('/social-consent', { state: { pendingToken, requiredTerms } })
- `SocialConsentPage.tsx`: location.state 없으면 navigate('/login'). ConsentList 재사용 + "가입 완료" 버튼 → `completeSocialSignup()` → `setAuth()` + 004 게이트로 진입
- `router.tsx`에 `/oauth/callback`, `/social-consent` 라우트 추가 (AuthShell 안, GuestOnly 밖)
- `SocialButtons.tsx` 활성화 (Apple은 B-3 이슈 후 조건부)

**US5: 비밀번호 찾기·재설정**
- `auth.ts`에 `requestPasswordReset()`, `verifyPasswordResetCode()`, `confirmPasswordReset()` 추가
- `PasswordResetForm.tsx`: 3단계 (Step 1: 이메일, Step 2: 코드, Step 3: 새 비밀번호) — 단일 컴포넌트 내 step state로 관리
- `ForgotPasswordPage.tsx`: PasswordResetForm 렌더

**US6: 약관 재동의**
- `terms.ts`에 `getConsents()`, `submitConsents()` 추가
- `ReConsentPage.tsx`: `getActiveTerms()` + `getConsents()` 조회 → 미동의 항목 표시 → `submitConsents()` → user 갱신 후 navigate (004 게이트 통과)

### Phase 3 — P3 (약관 열람)

**US7: 약관·개인정보 열람**
- `src/constants/legalText.ts`: `~/Downloads/Newsift_screens/screens3.jsx`의 LEGAL 객체에서 이용약관·개인정보처리방침 전문 텍스트 추출·이관 (코드/레이아웃이 아닌 텍스트 콘텐츠만, A-5 위반 없음)
- `TermsPage.tsx`: `legalText.SERVICE` 정적 텍스트를 AuthShell 카드 내 스크롤 가능 영역으로 렌더
- `PrivacyPage.tsx`: `legalText.PRIVACY` 정적 텍스트 렌더 (동일 패턴)
- 가입(RegisterForm) 및 재동의(ReConsentPage)의 "약관 보기" 링크 → `/terms`, `/privacy` 연결 명시
- `// TODO(#B-3-002): 버전 관리되는 백엔드 API로 이관` 주석 추가

## B-3 이슈 등록 필요 (구현 시작 전)

| 제목 | repo | 내용 |
|---|---|---|
| `[FE-blocked][005] Apple 소셜 form_post 백엔드 relay 미확인` | back | Apple이 SPA에 직접 POST 불가. 백엔드가 form_post 수신 후 GET redirect로 SPA에 전달해야 함. 미구현이면 Apple 버튼 비활성 유지. |
| `[FE][005] 약관 전문 백엔드 API 이관` | back | 현재 프로토타입 정적 텍스트(`src/constants/legalText.ts`)로 임시 구현. 버전 관리·다국어 지원을 위해 백엔드 API 이관 필요. (TermsPage/PrivacyPage 동작은 정상 — 블로커 아님) |

## Complexity Tracking

> Constitution 원칙 위반 없음. 추적 항목 없음.
