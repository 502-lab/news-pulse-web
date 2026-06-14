# Implementation Plan: 004 라우팅·인증 골격

**Branch**: `004-routing-auth-shell` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-routing-auth-shell/spec.md`

## Summary

Newsift SPA의 모든 화면이 올라갈 라우팅·인증 골격을 구축한다.
미인증 사용자 차단(returnTo 보존), 접근 게이트 순차 통과(재동의→이메일인증→온보딩→역할별 홈), 역할별 레이아웃 셸 분기(AuthShell / UserGnbLayout / AdminSidebarLayout), refreshToken 기반 세션 복원, 동시 401 처리 갱신 큐가 핵심 구현 대상이다. 개별 화면 본문 UI는 이 단계의 범위 밖이다.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode)

**Primary Dependencies (신규 설치 포함)**:
- React 19.2 + React Router v7.17 (라이브러리 모드)
- Zustand (인증 스토어)
- Axios (HTTP 클라이언트 + 갱신 큐 인터셉터)
- TanStack Query v5 (/me 서버 상태)
- Vitest + Testing Library + MSW (테스트)

**Storage**: accessToken — 메모리(Zustand), refreshToken — localStorage + rotation (constitution 2.0.0 승인된 차선책)

**Testing**: Vitest + @testing-library/react + MSW (이 spec에서 설치·설정)

**Target Platform**: 브라우저 (Chrome/Safari/Firefox 최신 2버전)

**Project Type**: SPA (Vite + React, 라이브러리 모드 라우터)

**Performance Goals**: 세션 복원 완료 후 라우트 이동 500ms 이내, 토큰 갱신 사용자 인지 없음

**Constraints**: 백엔드 httpOnly 쿠키 미지원 → localStorage 불가피 사용, CSP 필수

**Scale/Scope**: 18개 화면 라우트 슬롯, 3종 레이아웃 셸, 단일 앱 번들

## Constitution Check

| 원칙 | 상태 | 근거 |
|---|---|---|
| I. 아키텍처 경계 (프론트 전용) | ✅ 통과 | 백엔드 코드 없음, OpenAPI만 참조 |
| II. API Contract First | ✅ 통과 | openapi.yaml 기준 계약 작성, any 타입 없음 |
| III. Complete State Handling | ✅ 통과 | 세션 복원 중 스피너, 실패 시 에러 처리 |
| IV. Type Safety | ✅ 통과 | strict mode, /generated/api-types.ts 사용 |
| V. Accessibility | ✅ 통과 | 셸 컴포넌트 시맨틱 HTML, 키보드 내비게이션 |
| Auth — 토큰 보관 우선순위 | ✅ **통과** | constitution 2.0.0에서 우선순위형으로 재정의. accessToken=메모리 / refreshToken=localStorage + rotation은 현 백엔드 계약(응답 body 전달) 하의 승인된 차선책 |
| Testing Policy | ✅ **이 spec에서 해소** | Vitest + RTL + MSW 설치 |

## Project Structure

### Documentation (this feature)

```text
specs/004-routing-auth-shell/
├── plan.md              ← 이 파일
├── research.md          ← Phase 0 완료
├── data-model.md        ← Phase 1 완료
├── quickstart.md        ← Phase 1 완료
├── contracts/
│   └── auth-api.md      ← Phase 1 완료
├── checklists/
│   └── requirements.md
└── tasks.md             ← /speckit-tasks 명령 출력
```

### Source Code

```text
src/
├── app/
│   ├── router.tsx              ← createBrowserRouter, 전체 라우트 트리
│   └── App.tsx                 ← QueryClientProvider + RouterProvider
│
├── stores/
│   └── authStore.ts            ← Zustand AuthStore (user, accessToken, isLoading)
│
├── lib/
│   ├── tokenStorage.ts         ← localStorage refreshToken 유틸
│   └── api/
│       ├── client.ts           ← Axios 인스턴스 + 갱신 큐 인터셉터
│       └── auth.ts             ← login(), logout(), refreshToken(), getMe() API 함수
│
├── providers/
│   └── AuthProvider.tsx        ← 세션 복원 (restoreSession), isLoading 관리
│
├── components/
│   ├── layout/
│   │   ├── AuthShell.tsx           ← 중앙 카드 레이아웃 (auth·온보딩·오류)
│   │   ├── UserGnbLayout.tsx       ← GNB 5탭 + 프로필 메뉴 (USER)
│   │   └── AdminSidebarLayout.tsx  ← navy 사이드바 240px (ADMIN)
│   └── guards/
│       ├── ProtectedRoute.tsx      ← 미인증 → /login?returnTo
│       ├── GateRoute.tsx           ← 접근 게이트 우선순위 검사
│       ├── AdminRoute.tsx          ← USER의 /admin/* 차단
│       └── GuestOnlyRoute.tsx      ← 인증된 사용자의 /login, /register 차단
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx           ← 플레이스홀더 (005에서 구현)
│   │   ├── RegisterPage.tsx        ← 플레이스홀더
│   │   ├── ForgotPasswordPage.tsx  ← 플레이스홀더
│   │   ├── VerifyEmailPage.tsx     ← 슬롯 (게이트 목적지)
│   │   └── ReConsentPage.tsx       ← 슬롯 (게이트 목적지)
│   ├── onboarding/
│   │   └── OnboardingPage.tsx      ← 슬롯 (006에서 구현)
│   ├── user/
│   │   ├── HomePage.tsx            ← 플레이스홀더 (007에서 구현)
│   │   ├── TrendsPage.tsx          ← 플레이스홀더
│   │   ├── BiasPage.tsx            ← 플레이스홀더
│   │   ├── ArticleDetailPage.tsx   ← 플레이스홀더
│   │   ├── ComparePage.tsx         ← 슬롯
│   │   ├── InsightsPage.tsx        ← 슬롯
│   │   ├── WeeklyPage.tsx          ← 슬롯
│   │   └── SettingsPage.tsx        ← 슬롯
│   ├── admin/
│   │   ├── AdminHomePage.tsx       ← 플레이스홀더 (014에서 구현)
│   │   ├── IngestionPage.tsx       ← 슬롯
│   │   ├── ContentPage.tsx         ← 슬롯
│   │   ├── UsersAdminPage.tsx      ← 슬롯
│   │   └── NoticePage.tsx          ← 슬롯
│   └── error/
│       └── NotFoundPage.tsx        ← 404
│
└── __tests__/
    ├── authStore.test.ts
    ├── authInterceptor.test.ts
    ├── RouteGuards.test.tsx
    └── gateRedirect.test.ts

vitest.config.ts                    ← 신규 (jsdom, setupFiles)
```

## Complexity Tracking

> 모든 항목이 해소되어 현재 추적 중인 위반 없음.

| 항목 | 상태 | 근거 |
|---|---|---|
| refreshToken → localStorage | ✅ **원칙 개정으로 해소** | constitution 1.1.0이 절대 금지형을 우선순위형으로 교체. accessToken=메모리 / refreshToken=localStorage + rotation은 현 백엔드 계약 하의 승인된 방식 |
| localStorage 사용 (동일 원인) | ✅ **원칙 개정으로 해소** | 위 동일. 두 항목 모두 하나의 원칙에서 기인했으며 함께 해소됨 |
