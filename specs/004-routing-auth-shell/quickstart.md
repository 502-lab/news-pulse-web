# Quickstart: 004 라우팅·인증 골격 검증 가이드

## 사전 조건

```bash
# 의존성 설치 (004에서 신규 추가)
pnpm add zustand @tanstack/react-query axios
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom msw jsdom

# 개발 서버 실행
pnpm dev
```

> `.env.local`에 `VITE_API_URL=http://localhost:8080` 설정 필요

---

## 수동 검증 시나리오

### S-1. 게스트 접근 차단 + returnTo 복귀

1. 미인증 상태에서 `http://localhost:5173/home` 접근
2. **기대**: `/login?returnTo=%2Fhome`으로 리다이렉트
3. 로그인 성공
4. **기대**: `/home`으로 복귀

### S-2. 세션 복원 (새로고침)

1. 로그인 완료 상태에서 `/home` 접근
2. 브라우저 F5(새로고침)
3. **기대**: 로딩 스피너 표시 후 `/home` 유지 (로그인 화면으로 이동 안 함)

### S-3. 접근 게이트 우선순위

백엔드 응답 목업 또는 MSW 핸들러로 각 계정 상태를 설정:

| 계정 상태 | 로그인 후 이동 기대 경로 |
|---|---|
| requiresReConsent=true | `/re-consent` |
| emailVerified=false | `/verify-email` |
| onboardingCompleted=false | `/onboarding` |
| 모두 정상 + USER | `/home` |
| 모두 정상 + ADMIN | `/admin` |

### S-4. USER의 ADMIN 접근 차단

1. USER role 계정으로 로그인
2. 주소창에 `http://localhost:5173/admin` 직접 입력
3. **기대**: `/home`으로 리다이렉트

### S-5. 이미 로그인된 사용자의 /login 접근

1. 로그인 완료 상태에서 `http://localhost:5173/login` 접근
2. **기대**: 역할별 홈(`/home` 또는 `/admin`)으로 리다이렉트

### S-6. 자동 토큰 갱신 (MSW 테스트)

단위 테스트(`src/__tests__/authInterceptor.test.ts`)로 검증:

- 401 응답 → 갱신 성공 → 원 요청 재시도
- 동시 3개 요청 401 → 갱신 1회 → 3개 재시도
- 갱신 실패 → 강제 로그아웃

### S-7. 로그아웃

1. 로그인 완료 상태에서 프로필 메뉴 → 로그아웃 클릭
2. **기대**: 로그인 화면으로 이동, localStorage의 refreshToken 삭제

---

## 레이아웃 셸 시각 확인

| 경로 | 기대 레이아웃 |
|---|---|
| `/login`, `/register`, `/forgot-password` | 중앙 카드 (내비게이션 없음) |
| `/home`, `/trends`, `/bias` | 상단 GNB 5탭 + 프로필 메뉴 |
| `/admin`, `/admin/*` | 좌측 navy 사이드바 240px + 본문 |
| `/terms`, `/404` | 중앙 카드 (내비게이션 없음) |

---

## 테스트 실행

```bash
# 단위 테스트
pnpm vitest run

# 커버리지
pnpm vitest run --coverage

# 핵심 테스트 파일
src/__tests__/
├── authStore.test.ts         ← AuthStore 상태 전이 검증
├── authInterceptor.test.ts   ← 갱신 큐 패턴, 동시 401 처리
├── RouteGuards.test.tsx      ← ProtectedRoute, AdminRoute, GuestOnlyRoute
└── gateRedirect.test.ts      ← 접근 게이트 우선순위 검증
```

---

## 참조

- API 계약: [contracts/auth-api.md](./contracts/auth-api.md)
- 데이터 모델: [data-model.md](./data-model.md)
- openapi: `spec/api-contract/openapi.yaml`
