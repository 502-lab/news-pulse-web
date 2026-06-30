# Feature Specification: 007 온보딩 (W-12)

**Feature Branch**: `007-onboarding`

**Created**: 2026-06-28

**Status**: Draft

**Design Source**: `~/Downloads/Newsift_screens 2/screens4.jsx` (`OnboardingDesktop`) + `auth-04-onboarding-W12.html`

---

## Overview

로그인했지만 온보딩을 완료하지 않은 신규 사용자가 `/onboarding` 진입 시 마주치는 **5단계 멀티스텝 설정 플로우**.  
프로필·관심사·키워드·읽기 취향·브리핑 설정을 수집해 `POST /api/v1/me/onboarding`에 일괄 저장하고, 이후 뉴스 홈(WU01)이 개인화 큐레이션을 제공하는 기반을 만든다.

**플랫폼 범위**: 데스크탑 전용 (≥1280px). 모바일/앱 온보딩은 별도 트랙.

---

## User Scenarios & Testing

### US-1 — 신규 사용자 온보딩 완주 (Priority: P1)

신규 로그인 사용자가 5단계를 순서대로 진행해 설정을 저장하고 뉴스 홈으로 이동한다.

**Why this priority**: 온보딩 완주 없이는 개인화 뉴스피드가 동작하지 않는다. 전체 기능의 입구.

**Independent Test**: 1단계 ~ 5단계 전부 입력 후 "Newsift 시작하기" 클릭 → API 호출 성공 → `/home` 이동.

**Acceptance Scenarios**:

1. **Given** 신규 로그인 사용자, **When** `/onboarding` 접근, **Then** 데스크탑 멀티스텝 카드(좌측 레일 + 우측 콘텐츠) 렌더.
2. **Given** 1단계(프로필), **When** 닉네임 입력 + 연령대·직업 선택 후 "다음" 클릭, **Then** 2단계로 이동하고 레일의 1단계가 완료(체크) 상태.
3. **Given** 5단계 완료 후 "Newsift 시작하기" 클릭, **When** API 저장 성공, **Then** `/home`으로 이동.

---

### US-2 — 2단계 관심사 최소 선택 강제 (Priority: P1)

2단계에서 관심 토픽을 3개 미만 선택한 상태에서는 "다음" 버튼이 비활성화되어 진행이 불가능하다.

**Why this priority**: API가 `categories` 최소 3개를 필수 제약으로 강제하므로 프런트에서 사전 차단해야 한다 (422 방지).

**Independent Test**: 2단계에서 토픽 2개 선택 → 버튼 비활성. 3번째 선택 → 버튼 활성.

**Acceptance Scenarios**:

1. **Given** 2단계 진입, **When** 토픽 0~2개 선택됨, **Then** "다음" 버튼 비활성(클릭 불가), "N개 선택됨" 카운터 표시.
2. **Given** 2단계, **When** 토픽 3개 이상 선택됨, **Then** "다음" 버튼 활성화.

---

### US-3 — 선택 단계 건너뛰기 (Priority: P2)

3단계(키워드)·4단계(읽는 방식)는 "건너뛰기"로 선택 없이 통과할 수 있다.

**Why this priority**: 선택 입력 단계를 강제하면 이탈률 상승. 건너뛴 경우 해당 필드는 빈 값/기본값으로 저장.

**Independent Test**: 3단계 "건너뛰기" 클릭 → 4단계 이동, 키워드 미선택 상태.

**Acceptance Scenarios**:

1. **Given** 3단계, **When** "건너뛰기" 클릭, **Then** 4단계로 이동, 키워드 목록은 비어있음.
2. **Given** 4단계, **When** "건너뛰기" 클릭, **Then** 5단계로 이동, summaryDepth·consumeMode 기본값 유지.
3. **Given** 1·2·5단계, **When** 화면 렌더, **Then** "건너뛰기" 버튼 없음.

---

### US-4 — 이미 완료한 사용자 재진입 방지 (Priority: P1)

온보딩 완료 사용자가 `/onboarding`에 접근하면 `/home`으로 즉시 리다이렉트된다.

**Why this priority**: 무한 온보딩 루프 방지. UX 및 데이터 무결성 보호.

**Independent Test**: 온보딩 완료 상태로 `/onboarding` URL 직접 입력 → `/home` 리다이렉트.

**Acceptance Scenarios**:

1. **Given** `onboardingCompleted: true` 사용자, **When** `/onboarding` 접근, **Then** `/home`으로 즉시 리다이렉트.
2. **Given** 미로그인 사용자, **When** `/onboarding` 접근, **Then** `/login`으로 리다이렉트 (기존 `ProtectedRoute` 처리).

---

### US-5 — API 저장 실패 시 재시도 (Priority: P2)

마지막 단계 제출 시 API 오류가 발생하면 에러 메시지를 표시하고 재시도 가능하다.

**Why this priority**: 네트워크 오류·서버 오류 시 데이터 손실 없이 재시도해야 한다.

**Independent Test**: 5단계 "Newsift 시작하기" → API 500 응답 → 에러 토스트 + 버튼 재활성.

**Acceptance Scenarios**:

1. **Given** 5단계 제출 중, **When** API 실패(`5xx` 또는 네트워크 오류), **Then** 에러 메시지 표시, 버튼 재활성화, 홈 미이동.
2. **Given** API 422 응답(`categories` 최소 미달), **Then** 에러 표시 (프런트 사전 검증으로 정상 플로에서는 발생 불가).

---

### US-6 — 5단계 음성 단계 웹 전용 처리 (Priority: P2)

AI 음성 캐릭터(하린/준서)를 선택할 수 있으나, 웹에서는 음성 미리듣기가 비활성화된다. 앱 설치 유도 버튼이 비활성 placeholder로 제공된다.

**Why this priority**: 크로스플랫폼 일관성. 웹 사용자도 음성 설정을 저장해야 하며, 앱 기능과의 차이를 명확히 안내해야 한다.

**Independent Test**: 5단계에서 재생 버튼 클릭 불가, "앱에서 미리듣기" 안내 텍스트 표시, 앱 설치 버튼 클릭 불가.

**Acceptance Scenarios**:

1. **Given** 5단계 음성 영역, **When** 렌더, **Then** 재생 버튼이 시각적으로 비활성, 클릭 무반응, "앱에서 미리듣기" 안내 문구 표시.
2. **Given** 앱 설치 유도 버튼, **When** 클릭, **Then** 아무 동작 없음(no-op, disabled).

---

### Edge Cases

- 닉네임 12자 초과 입력 시도 → 12자에서 자동 차단 (UI 입력 제한).
- 연령대·직업 미선택 상태로 "다음" 클릭 → 디자인에 명시적 검증 없음. **Assumption A** 참조.
- 5단계 제출 중 로딩 상태에서 이중 클릭 → 버튼 비활성(로딩 중 중복 제출 방지).
- 브리핑 시간 미선택 상태로 제출 → API는 `briefingTime` optional이므로 미포함 전송 허용.
- 온보딩 진행 중 브라우저 새로고침 → 1단계부터 재시작 (중간 저장 없음, Deferred).

---

## Requirements

### Functional Requirements

**화면 구조**

- **FR-001**: `/onboarding` 화면은 좌측 단계 레일(navy 배경, 260px)과 우측 콘텐츠 영역으로 구성된 중앙 카드(`max-w-[940px]`, `shadow-pop`)를 렌더해야 한다. 디자인 기준: `OnboardingDesktop`.
- **FR-002**: 좌측 레일은 5단계를 세로 나열하며, 각 단계는 완료(brand 체크 아이콘)/현재(흰색 숫자)/대기(반투명 숫자) 중 하나의 상태를 표시해야 한다.
- **FR-003**: 우측 콘텐츠 상단에 `STEP n / 5` 레이블, 단계 제목, 설명 문구를 표시해야 한다.
- **FR-004**: 우측 하단 푸터에 "이전" 버튼(1단계에서 비활성)과 "다음"/"Newsift 시작하기" 버튼을 배치해야 한다.

**단계별 내용**

- **FR-005** [Step 1]: 닉네임 입력(최대 12자, 실시간 글자수 표시), 연령대 4종 단일 선택(라디오 스타일), 직업 7종 단일 선택(태그 스타일)을 제공해야 한다.
- **FR-006** [Step 2]: 관심 토픽 8종을 2×4 그리드로 표시하고 토글 선택이 가능해야 한다. 선택된 토픽 수를 실시간으로 표시해야 한다.
- **FR-007** [Step 3]: 기업·브랜드 / 테마·이슈 / 인물 그룹별 키워드를 태그 토글로 선택할 수 있어야 한다. 건너뛰기 허용.
- **FR-008** [Step 4]: 요약 깊이 3종(핵심만/균형/깊이있게), 소비 모드 3종(읽기/듣기/둘 다)을 각각 단일 선택으로 제공해야 한다. 건너뛰기 허용.
- **FR-009** [Step 5]: 브리핑 시간대 3종(07:30·12:30·21:00), AI 음성 캐릭터 2종(하린/준서), 푸시 알림 토글을 제공해야 한다.

**검증·제어**

- **FR-010**: 2단계에서 선택된 관심 토픽이 3개 미만이면 "다음" 버튼을 비활성화해야 한다.
- **FR-011**: 3·4단계에 "건너뛰기" 버튼을 제공해야 한다. 1·2·5단계에는 없다.
- **FR-012**: "이전" 버튼은 1단계에서 비활성(disabled)이어야 한다.

**음성 웹 전용 처리**

- **FR-013**: 5단계 음성 카드의 재생 버튼은 비활성(disabled) 상태로 렌더하고, "앱에서 미리듣기" 보조 안내 문구를 표시해야 한다.
- **FR-014**: 앱 설치 유도 버튼은 비활성 placeholder로 렌더하며 클릭 동작이 없어야 한다 (목적지 URL 미연결, Deferred).

**라우팅 가드**

- **FR-015**: `/onboarding`은 로그인된 사용자만 접근 가능해야 한다 (기존 `ProtectedRoute` 활용).
- **FR-016**: 로그인했고 `onboardingCompleted: true`인 사용자가 `/onboarding` 접근 시 즉시 `/home`으로 리다이렉트해야 한다.

**저장 및 상태**

- **FR-017**: "Newsift 시작하기" 클릭 시 수집한 전체 설정을 `POST /api/v1/me/onboarding`에 단일 호출로 전송해야 한다.
- **FR-018**: 저장 중 로딩 상태를 사용자에게 표시해야 한다(버튼 비활성 + 스피너).
- **FR-019**: API 저장 실패 시 에러 메시지를 표시하고 재시도를 허용해야 한다.
- **FR-020**: 저장 성공 시 auth 상태의 `onboardingCompleted`를 `true`로 갱신하고 `/home`으로 이동해야 한다.
- **FR-021**: 단계 이동·단계별 검증·최종 제출 로직은 뷰 컴포넌트에서 분리해야 한다.

**접근성**

- **FR-022**: 모든 선택 버튼은 키보드 접근 가능하고 선택 상태를 `aria-pressed` 또는 `aria-checked`로 노출해야 한다.
- **FR-023**: 닉네임 입력 필드는 연결된 `<label>`을 가져야 한다.

### Key Entities

- **OnboardingPayload**: 5단계에서 수집되는 전체 설정. 닉네임, 연령대, 직업, 관심 토픽 목록(`categories`), 팔로우 키워드 목록(`keywords`), 요약 깊이, 소비 모드, 브리핑 시간, 타임존 오프셋(자동감지), 음성 활성 여부(`voiceEnabled`), 푸시 동의.
- **OnboardingStep**: 현재 단계 번호(1~5) + 각 단계별 입력값의 집합. 단계 전이 로직이 관리하는 핵심 상태.
- **API 필드 매핑**:

  | 디자인 단계 | 필드 | API 필드 | 타입 |
  |---|---|---|---|
  | 1 | 닉네임 | `nickname` | string |
  | 1 | 연령대 | `ageGroup` | `TWENTIES`\|`THIRTIES`\|`FORTIES`\|`FIFTIES_PLUS` |
  | 1 | 직업 | `occupation` | string |
  | 2 | 관심 토픽 | `categories` | string[] (min 3) |
  | 3 | 키워드 | `keywords` | `{keyword, type: COMPANY\|THEME\|PERSON}[]` |
  | 4 | 요약 깊이 | `summaryDepth` | `BRIEF`\|`BALANCED`\|`DEEP` |
  | 4 | 소비 모드 | `consumeMode` | `READ`\|`LISTEN`\|`BOTH` |
  | 5 | 브리핑 시간 | `briefingTime` | `HH:mm` |
  | 5 (자동) | 타임존 | `timezoneOffset` | number (분, 자동감지) |
  | 5 | AI 음성 활성 | `voiceEnabled` | boolean |
  | 5 | 푸시 알림 | `pushAgreed` | boolean |

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 사용자가 1단계부터 5단계까지 완주하고 뉴스 홈에 도달하는 데 걸리는 시간이 2분 이내여야 한다.
- **SC-002**: 2단계 관심사 선택 → "다음" 버튼 상태 전환(비활성↔활성)이 선택 즉시(0.1초 이내) 반영되어야 한다.
- **SC-003**: "Newsift 시작하기" 클릭부터 `/home` 진입까지 API 응답 후 전환 지연이 0.5초 이내여야 한다.
- **SC-004**: 온보딩 완료 사용자가 `/onboarding` URL 재접근 시 `/home` 리다이렉트가 렌더 플래시 없이 즉각 이루어져야 한다.
- **SC-005**: 저장 실패 시 에러 메시지가 제출 버튼 클릭 후 2초 이내에 표시되어야 한다.
- **SC-006**: 데스크탑(≥1280px) 환경에서 디자인 기준(`OnboardingDesktop`)의 레이아웃과 픽셀 수준으로 일치해야 한다.

---

## Assumptions

**A. 1단계 필드 검증**: 디자인에 연령대·직업 미선택 시 명시적 에러 표시가 없다. 이 스펙은 1단계 "다음" 버튼을 **항상 활성**(검증 없음)으로 가정한다. 닉네임은 빈 값도 허용(API `nickname` optional). 이 결정은 plan에서 재검토 가능.

**B. 음성 캐릭터 ID 저장 불가 (API 갭)**: 디자인은 하린/준서 중 선택을 UI로 제공하지만, `OnboardingRequest`에 `voiceId` 필드가 없고 `voiceEnabled: boolean`만 존재한다. 따라서 **음성 캐릭터 선택값은 저장 대상에서 제외하고 `voiceEnabled: true`만 전송**한다. 캐릭터 ID가 필요하면 백엔드에 필드 추가 요청이 필요하다. → plan에서 GitHub 이슈 등록 여부 결정.

**C. 온보딩 완료 여부 판별**: `AuthUser` 타입에 `onboardingCompleted` 필드가 현재 없다. API `AccountSummaryResponse`에는 존재하므로, plan 단계에서 `AuthUser` 타입 확장 및 `getMe()` 응답 반영을 확정한다. 대안으로 `GET /api/v1/me/onboarding/status`를 별도 호출할 수도 있다. → **plan에서 확정 필요한 항목**.

**D. 중간 저장 없음**: 단계 진행 중 새로고침하면 1단계부터 재시작한다. URL 기반 단계 상태 복원은 Deferred.

**E. 타임존 오프셋**: 브라우저 `new Date().getTimezoneOffset() * -1`로 자동 감지. 사용자에게 노출하지 않는다.

**F. 직업 입력**: API `occupation`은 free text이지만 UI는 7종 고정 선택지 제공. 선택한 레이블 문자열을 그대로 전송한다.

**G. 카테고리 enum 매핑**: 디자인 토픽 레이블(예: '경제·금융')과 API enum(예: `ECONOMY_FINANCE`)의 매핑 테이블은 plan/constants 정의 단계에서 확정한다.

---

## Open Items (plan에서 확정)

| # | 항목 | 현재 상태 |
|---|---|---|
| O-1 | `AuthUser` 타입에 `onboardingCompleted` 추가 여부, 또는 별도 상태 API 호출 방식 선택 | plan 확정 필요 |
| O-2 | 음성 캐릭터 ID 저장 갭 — 백엔드 이슈 등록 여부 | plan에서 B-3 절차 판단 |
| O-3 | 1단계 연령대·직업 미선택 시 "다음" 허용 여부 | plan에서 재검토 |

---

## Out of Scope / Deferred

- 모바일/앱 온보딩 (`OnboardingScreen`) 구현
- 웹 TTS 음성 미리듣기 실재생
- 앱 설치 버튼 실제 스토어/딥링크 연결
- 온보딩 중간 저장 및 단계 복원 (새로고침 시 재시작)
- 온보딩 수집 취향의 실제 뉴스 큐레이션 반영 (후속 단계)
- 온보딩 설정 이후 마이페이지에서 재편집
