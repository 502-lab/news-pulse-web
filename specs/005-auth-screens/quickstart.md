# Quickstart Validation Guide: 005 인증 화면

**Date**: 2026-06-15 | **Branch**: `005-auth-screens`

---

## 전제 조건

- Node.js 20+, pnpm 9+
- `.env.local` 에 `VITE_API_URL=http://localhost:8080` 설정
- MSW 핸들러가 `src/__tests__/` 또는 `src/mocks/` 에 설정되어 있을 것
- 004가 완료 상태여야 함 (AuthShell, authStore, 가드 동작 확인)

---

## 실행 명령

```bash
# 개발 서버
pnpm dev

# 타입 검사
pnpm tsc --noEmit

# 빌드
pnpm build

# 테스트 (전체)
pnpm test

# 테스트 (인증 관련만)
pnpm test --reporter=verbose src/__tests__/auth
```

---

## S-1: 이메일 로그인 (US1)

**MSW 핸들러**: `POST /api/v1/auth/login` → 200 `{ account, tokens }`

**시나리오 A — returnTo 복귀**
1. 미인증 상태에서 `/home` 접근 → 자동으로 `/login?...` 또는 state.returnTo 포함 리다이렉트
2. `/login`에서 `test@example.com` / `Password1` 입력 후 제출
3. 기대: `/home` 으로 이동, 상단 GNB 표시

**시나리오 B — 오류 메시지**
1. 틀린 비밀번호 입력 후 제출 (MSW → 401)
2. 기대: "이메일 또는 비밀번호가 올바르지 않습니다." 표시, 폼 재시도 가능

**시나리오 C — 클라이언트 검증**
1. 이메일 비워두고 제출
2. 기대: 서버 요청 없이 필드 오류 표시

**자동화 테스트 파일**: `src/__tests__/loginPage.test.tsx`

---

## S-2: 이메일 회원가입 (US2)

**MSW 핸들러**: `GET /api/v1/terms` → 200 `[service, privacy, marketing]`  
**MSW 핸들러**: `POST /api/v1/auth/signup` → 201 `{ account, tokens }`

**시나리오 A — 성공 흐름**
1. `/register` 접근
2. 이메일 / 비밀번호(Password1) / 비밀번호확인 입력
3. 서비스이용약관·개인정보·만14세 체크 (필수 3개)
4. 제출 → 기대: `/verify-email` 로 이동

**시나리오 B — 필수 약관 미동의**
1. 만 14세 체크박스를 비운 채 제출
2. 기대: 제출 차단, 해당 항목 강조

**시나리오 C — 중복 이메일**
1. MSW → 409 응답
2. 기대: "이미 사용 중인 이메일입니다." 필드 오류

**자동화 테스트 파일**: `src/__tests__/registerPage.test.tsx`

---

## S-3: 소셜 로그인·가입 (US3, P2)

> ⚠️ 실 provider 키 미설정. MSW로만 검증.

**MSW 핸들러**: 
- `GET /api/v1/auth/kakao/authorize` → 200 `{ authorizeUrl: 'https://mock-kakao.com/...' }`
- `POST /api/v1/auth/kakao/callback` → 200 (기존) 또는 202 (신규)
- `POST /api/v1/auth/social/complete` → 201

**시나리오 A — 기존 회원**
1. `/login` 카카오 버튼 클릭
2. MSW가 `/oauth/callback` 를 시뮬레이션 (SocialCallbackPage에 code/state 전달)
3. MSW callback → 200 → setAuth → `/home` 이동

**시나리오 B — 신규 회원 (pending-token)**
1. MSW callback → 202 `{ pendingToken, requiredTerms }`
2. `/social-consent` 이동 확인
3. 약관 동의 후 "가입 완료" → MSW complete → 201 → `/home` 이동

**시나리오 C — state 불일치 (CSRF)**
1. MSW callback → 400
2. 오류 화면 표시, /login 링크 확인

**자동화 테스트 파일**: `src/__tests__/socialCallback.test.tsx`, `src/__tests__/socialConsent.test.tsx`

---

## S-4: 이메일 인증 (US4)

**MSW 핸들러**: `POST /api/v1/auth/email-verification/verify` → 200 `{ emailVerified: true }`

**시나리오 A — 코드 인증**
1. 로그인 후 `user.emailVerified=false` 상태로 GateRoute → `/verify-email` 리다이렉트
2. 6자리 코드 `123456` 입력 후 확인
3. 기대: authStore `emailVerified=true` → GateRoute 통과 → `/onboarding`

**시나리오 B — 재발송**
1. "재발송" 버튼 클릭 (MSW → 200)
2. 기대: "인증 메일이 재발송됐습니다." 안내

**자동화 테스트 파일**: `src/__tests__/verifyEmailPage.test.tsx`

---

## S-5: 비밀번호 재설정 (US5)

**MSW 핸들러**:
- `POST /api/v1/auth/password-reset/request` → 202
- `POST /api/v1/auth/password-reset/verify` → 200 `{ resetToken: 'mock-token' }`
- `POST /api/v1/auth/password-reset/confirm` → 204

**시나리오 A — 전체 3단계 흐름**
1. `/forgot-password` → 이메일 입력 → "재설정 메일 발송됨" 안내 (Step 2)
2. 코드 `123456` 입력 → Step 3 전환
3. 새 비밀번호 입력 → 기대: `/login` 이동 + "비밀번호가 변경됐습니다." 안내

**자동화 테스트 파일**: `src/__tests__/forgotPasswordPage.test.tsx`

---

## S-6: 약관 재동의 (US6)

**MSW 핸들러**:
- `GET /api/v1/terms` → 200 `[service_v2, privacy_v1, marketing_v1]`
- `GET /api/v1/me/consents` → 200 `[service_v1_agreed, ...]` (v2 미동의)
- `POST /api/v1/me/consents` → 200

**시나리오 A — 재동의 필수**
1. `user.requiresReConsent=true` MSW 설정 → 로그인 → GateRoute → `/re-consent`
2. 미동의 서비스 약관(v2) 동의 체크 후 제출
3. 기대: `requiresReConsent=false` → GateRoute 통과

**시나리오 B — 거부**
1. 재동의 화면에서 "거부" 클릭
2. 기대: 로그아웃 → `/login` 이동

**자동화 테스트 파일**: `src/__tests__/reConsentPage.test.tsx`

---

## S-7: 약관 열람 (US7)

**시나리오**
1. 미인증 상태에서 `/terms` 접근
2. 기대: AuthShell 렌더 + `legalText.SERVICE` 정적 텍스트 표시 (로그인 리다이렉트 없음)
3. `/privacy` → `legalText.PRIVACY` 동일
4. 가입 화면 "약관 보기" 링크 → `/terms` 연결 확인

**자동화 테스트 파일**: `src/__tests__/legalPages.test.tsx`

---

## 전체 통과 기준

- `pnpm tsc --noEmit` 오류 없음
- `pnpm build` 성공
- `pnpm test` — auth 관련 테스트 전체 통과
- SC-001: RTL의 `userEvent` 기반 타이머로 500ms 이내 이동 확인
- SC-006: `userEvent.tab()` 으로 로그인 폼 키보드 탐색 완료 가능
- SC-008: 모든 폼 input에 `aria-label` 또는 `<label htmlFor>` 연결 확인
