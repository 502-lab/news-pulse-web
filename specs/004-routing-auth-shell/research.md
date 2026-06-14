# Research: 004 라우팅·인증 골격

## 1. 실제 기술 스택 확인 (package.json 기준)

| 항목 | CLAUDE.md 기재 | package.json 실제 | 비고 |
|---|---|---|---|
| React | 18 | **19.2.6** | v19 Concurrent 기능 활용 가능 |
| React Router | v6 | **v7.17.0** | API 일부 변경, 하위 호환 대부분 유지 |
| TypeScript | - | **6.0.2** | strict mode 기본 강화 |
| Zustand | 명시 | **미설치** | 이 spec에서 설치 필요 |
| Axios | 명시 | **미설치** | 이 spec에서 설치 필요 |
| TanStack Query | 명시 | **미설치** | /me 쿼리에 필요, 이 spec에서 설치 |
| 테스트 프레임워크 | 명시 | **미설치** | Vitest + Testing Library 설치 필요 |

> **액션**: CLAUDE.md의 React/Router 버전 기재를 다음 PR에서 정정한다.

---

## 2. React Router v7 라이브러리 모드 라우트 가드 패턴

**Decision**: `createBrowserRouter` + 래퍼 컴포넌트 방식 (loader 없이)

**Rationale**:
- v7 프레임워크 모드(파일 기반 라우팅)는 Vite 플러그인 교체가 필요해 기존 셋업과 충돌
- 라이브러리 모드는 v6와 동일한 `createBrowserRouter` → `RouterProvider` 패턴 사용
- 가드 로직은 `<ProtectedRoute>`, `<AdminRoute>`, `<GuestOnlyRoute>` 래퍼 컴포넌트로 구현
- `<Navigate>` 컴포넌트로 리다이렉트, `state={{ returnTo }}` 로 경로 보존

```
RouteGuard 컴포넌트 책임 분리:
- <ProtectedRoute>: 미인증 → /login?returnTo=...
- <GateRoute>: 접근 게이트 우선순위 검사 (재동의/이메일인증/온보딩)
- <AdminRoute>: USER의 /admin/* 접근 차단
- <GuestOnlyRoute>: 인증된 사용자의 /login, /register 접근 시 역할별 홈으로
```

**Alternatives considered**:
- Router v7 loader 기반 가드: 서버 사이드 data API와 결합되어 복잡도 증가, 현재 SPA 스코프에 과함
- 단일 `<AuthGuard>` 컴포넌트에 모든 로직 집중: 100줄 초과 가능성, 단일 책임 원칙 위배

---

## 3. 동시 401 처리 — 갱신 큐(Refresh Queue) 패턴

**Decision**: 단일 갱신 비행(single refresh flight) + 대기 큐 패턴

**Rationale**:
- 여러 API가 동시에 401을 받으면 갱신 요청이 중복 발생해 rotation 토큰이 순차 무효화됨
- 첫 번째 요청이 갱신을 시작하면 나머지는 `Promise` 큐에 대기
- 갱신 성공 시 큐의 모든 요청에 새 토큰 전달 → 재시도
- 갱신 실패 시 큐 전체 reject → 강제 로그아웃

```typescript
// 개념적 구조 (구현 상세는 tasks에서)
let isRefreshing = false;
let pendingQueue: Array<{ resolve; reject }> = [];

// 401 인터셉터에서:
if (isRefreshing) {
  return new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }));
}
isRefreshing = true;
// ... 갱신 후 큐 드레인
```

**Alternatives considered**:
- 각 요청 독립 갱신: rotation 토큰 연쇄 무효화로 로그아웃 발생
- debounce 방식: 타이밍 의존적, 테스트 불안정

---

## 4. Zustand 인증 스토어 설계

**Decision**: Zustand persist 없이, 메모리 전용 accessToken + localStorage 직접 관리

**Rationale**:
- Zustand persist 미들웨어를 쓰면 accessToken이 스토리지에 직렬화될 위험
- refreshToken은 Zustand 바깥에서 localStorage를 직접 읽고 쓰는 util 함수로 관리
- 스토어에는 `user`, `accessToken`, `isLoading` 만 유지

```
authStore: { user: AuthUser|null, accessToken: string|null, isLoading: boolean }
tokenStorage: { getRefreshToken, setRefreshToken, clearRefreshToken } (localStorage 직접 접근)
```

**Alternatives considered**:
- Zustand persist: accessToken 스토리지 노출 위험
- React Context: 전역 리렌더 문제, 대형 앱에서 성능 저하

---

## 5. 앱 부팅 시 세션 복원 흐름

**Decision**: `AuthProvider` 컴포넌트가 마운트 시 `restoreSession()` 호출

```
앱 시작
  └─ AuthProvider.useEffect
       ├─ localStorage에서 refreshToken 읽기
       ├─ 없으면 → isLoading=false, user=null (게스트)
       └─ 있으면 → POST /auth/refresh 호출
            ├─ 성공 → accessToken 메모리 저장, GET /me 호출 → user 설정, isLoading=false
            └─ 실패 → localStorage clearRefreshToken, isLoading=false, user=null
```

**isLoading=true 동안**: `<GateRoute>`는 `<FullPageSpinner>`만 렌더, 리다이렉트 없음

---

## 6. 새로 설치할 패키지

```bash
pnpm add zustand @tanstack/react-query axios
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom msw jsdom
```

| 패키지 | 용도 | 선택 이유 |
|---|---|---|
| zustand | 인증 상태 스토어 | 경량, React 외부 접근 가능(인터셉터에서 사용) |
| @tanstack/react-query | /me 서버 상태 | 캐싱·staleTime 관리, CLAUDE.md 명시 |
| axios | HTTP 클라이언트 + 인터셉터 | 갱신 큐 구현에 인터셉터 필수 |
| vitest | 단위 테스트 러너 | Vite 기반 프로젝트 표준, 빠른 실행 |
| @testing-library/* | 컴포넌트·훅 테스트 | Constitution 요구사항 |
| msw | API 목킹 | 훅 테스트에서 네트워크 계층 모킹 |

---

## 7. Constitution 위반 검토

| 원칙 | 위반 여부 | 상세 |
|---|---|---|
| III-1. JWT → httpOnly 쿠키 | **위반 (정당화됨)** | 백엔드가 response body로 토큰 반환, httpOnly 쿠키 미지원. refreshToken → localStorage는 불가피 |
| III-2. localStorage 금지 | **위반 (정당화됨)** | 위와 동일 원인. accessToken은 메모리 유지로 위험 최소화 |
| Testing Policy | **미이행 → 이 spec에서 해소** | 테스트 프레임워크 미설치, 이 spec에서 설치·설정 |

refreshToken localStorage 저장은 XSS 위험이 있으므로 CSP 헤더와 입력 새니타이즈를 병행한다. BFF/쿠키 방식으로의 전환은 백엔드 지원 확정 후 별도 spec에서 처리한다.
