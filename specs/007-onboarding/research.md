# Research: 007 온보딩 (W-12)

**Date**: 2026-06-29 | **Branch**: `007-onboarding`

---

## R-01. 기존 구현 현황 (가장 중요한 발견)

**Decision**: `OnboardingPage.tsx`는 이미 존재하고 API 연동·라우팅·인증 가드가 모두 동작한다. 이번 작업은 **신규 구현이 아닌 디자인 재구현(redesign)**이다.

| 항목 | 상태 | 비고 |
|---|---|---|
| `/onboarding` 라우트 | ✅ 이미 등록 | `router.tsx` line 97 |
| `ProtectedRoute` 가드 | ✅ 이미 적용 | |
| `GateRoute` 온보딩 가드 | ✅ 이미 구현 | `!user.onboardingCompleted → /onboarding` |
| `submitOnboarding()` API 함수 | ✅ 이미 존재 | `src/lib/api/auth.ts:155` |
| `AuthUser.onboardingCompleted` | ✅ 이미 존재 | `AccountSummaryResponse` 필드 |
| 저장 성공 후 낙관적 갱신 | ✅ 이미 구현 | `setAuth({ ...user, onboardingCompleted: true }, accessToken)` |
| 5단계 상태 관리 | ⚠️ 평면 `useState` 14개 | FR-021 위반, 컨트롤러 분리 필요 |
| 디자인 일치 | ❌ 불일치 | 단순 레이아웃, `OnboardingDesktop` 아님 |

**Rationale**: 기존 코드를 최대한 보존하되 (1) 컨트롤러 훅 분리, (2) 디자인 재구현에 집중한다.

---

## R-02. Open Item O-1 확정 — `AuthUser.onboardingCompleted`

**Decision**: `AuthUser = AccountSummary = components['schemas']['AccountSummaryResponse']`로 이미 `onboardingCompleted: boolean` 필드 포함. **타입 확장 불필요**, 기존 `getMe()` 응답이 이 필드를 반환한다.

**Rationale**: `AccountSummaryResponse` (OpenAPI line 4433)에 `onboardingCompleted: boolean` 정의됨. `AuthProvider`가 부팅 시 `getMe()` 호출 → 세션 복원 시 `onboardingCompleted` 자동 로드.

**낙관적 갱신 방식 확정**: 저장 성공 시 `setAuth({ ...user, onboardingCompleted: true }, accessToken)` 낙관적 갱신 + `navigate('/home', { replace: true })`. 서버 재조회 불필요(저장=완료 확신).

---

## R-03. Open Item O-2 확정 — voiceId 갭

**Decision**: `OnboardingRequest`에 `voiceId` 필드 없음. 음성 캐릭터 선택(하린/준서) UI는 표시하되, 캐릭터를 선택하면 `voiceEnabled: true`로만 전송. 미선택 시 `voiceEnabled: false`.

**Rationale**: 사용자 경험상 캐릭터 선택 UI를 제거하는 것보다 선택을 허용하되 저장은 `voiceEnabled`만 하는 것이 자연스럽다. 추후 백엔드가 `voiceId` 지원 시 확장 가능.

---

## R-04. Open Item O-3 확정 — 1단계 닉네임 필수

**Decision**: `nick.trim().length > 0` → 1단계 canProceed 조건. spec Assumption A 덮어쓰기.

**Rationale**: 닉네임 없이는 개인화 뉴스 경험의 맥락이 없다. 디자인 `screens4.jsx`도 닉네임 필드가 1단계의 첫 번째이자 가장 부각된 입력 항목.

---

## R-05. 데이터 상수 불일치 (기존 코드 vs 디자인)

기존 `OnboardingPage.tsx`의 상수가 `screens4.jsx` 디자인과 다름. 디자인 기준으로 수정:

| 항목 | 기존 코드 | 디자인 기준 | 조치 |
|---|---|---|---|
| 연령대 수 | 5종 (TEENS 포함) | 4종 (20대~50대이상) | TEENS 제거 |
| 직업 | ['직장인','학생','프리랜서','창업자','기타'] 5종 | ['IT·개발','금융·경제','미디어·마케팅','학생','전문직','공공·행정','기타'] 7종 | 디자인으로 교체 |
| 토픽 카드 | 이모지 기반 | `Icon` 컴포넌트 + 컬러 배경 | Icon 사용으로 재구현 |
| 건너뛰기 | 없음 | 3·4단계에 존재 | 추가 |
| 5단계 음성 | voiceEnabled 토글만 | 캐릭터 선택(하린/준서) + disabled play | 재구현 |
| 닉네임 레이블 | "(선택)" | 필수 (계획 변경) | 레이블 수정 |

---

## R-06. `submitOnboarding` 반환 타입 버그

**Decision**: 기존 반환 타입 `Promise<OnboardingStatusResponse>`를 `Promise<void>`로 수정.

**Rationale**: `POST /api/v1/me/onboarding`은 `ApiResponseVoid`를 반환한다 (OpenAPI line 497-502). `OnboardingStatusResponse`는 `GET /api/v1/me/onboarding/status` 응답 타입이며 잘못 사용됨. 반환값을 사용하지 않으므로 기능 영향은 없으나 타입 정확성 수정 필요.

---

## R-07. Icon 가용성 — 디자인 아이콘 전부 사용 가능

`src/components/ui/Icon.tsx`에 디자인 `screens4.jsx`가 사용하는 모든 아이콘 확인:
`trend`, `cpu`, `bank`, `trophy`, `globe`, `film`, `heart`, `car`, `sparkles`, `mic`, `clock`, `bell`, `play`, `plus`, `check`, `arrowright`, `arrowleft`, `chevright` — 전부 존재.

---

## R-08. 컨트롤러 분리 방향 확정

**Decision**: `useReducer` 기반 `useOnboarding` 훅. 뷰 컴포넌트는 훅이 반환하는 상태/액션만 사용.

**Rationale**: 14개 `useState`를 단일 `useReducer`로 통합하면 (1) 단계 전이 로직이 한 곳에, (2) `canProceed` 파생 로직 응집, (3) 테스트 가능성 향상. 기존 `useOnbState` 패턴보다 명시적 액션 타입으로 의도가 명확함.

---

## R-09. 레이아웃 측정 — 데스크탑 카드

`OnboardingDesktop` 실측:
- 컨테이너: `max-w-[940px]`, `shadow-pop`, `rounded-2xl`, 높이 `min(680px, 92vh)`
- 좌측 레일: `w-[260px]`, `bg-navy`, `text-white`, `p-7`
- 우측 콘텐츠: `flex-1`, `overflow-y-auto`, `px-9 py-8`
- 푸터: `border-t border-ink-100 px-9 py-4`

`shadow-pop` = `0 8px 28px rgba(15,23,42,.16)` → `tailwind.config.ts` 기존 토큰 `shadow-pop` 사용.
`min(680px, 92vh)` → Tailwind arbitrary `min-h-[680px]` + `max-h-[92vh]` 조합 또는 `style={{ height: 'min(680px, 92vh)' }}` 인라인 예외 (연속값, plan Constraints 등록).

**인라인 스타일 예외**: 높이 `min(680px, 92vh)` 하나만 허용. 이유: CSS `min()` 함수는 Tailwind arbitrary value로는 표현 가능하나 `min-[min(680px,92vh)]`는 Tailwind v4 지원 검증 필요 → 안전하게 인라인 예외 허용.
