# Feature Specification: 디자인 토큰 & 공유 UI 컴포넌트 시스템

**Feature Branch**: `feat/001-design-token-components`

**Created**: 2026-06-10

**Status**: Draft

**Input**: Spec Unit 001 — 디자인 토큰 & 컴포넌트 시스템

---

## Overview

Newsift 대시보드 전체에서 공통으로 사용하는 디자인 토큰(색상·타이포·간격·그림자)과 기반 UI 컴포넌트 10종을 확정한다. 이 스펙이 완료되어야 레이아웃(002)부터 인증(007)까지 동일한 디자인 언어로 구현할 수 있다.

**범위 외**: 차트 컴포넌트(→ 003·004), 레이아웃/사이드바/헤더(→ 002), 인증 전용 컴포넌트(→ 007).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 화면 개발자가 일관된 토큰으로 페이지 구현 (Priority: P1)

002~007 페이지를 구현하는 개발자가 색상·간격·그림자를 매번 임의로 정의하지 않고, 미리 확정된 Tailwind 토큰만 사용해 화면을 구성할 수 있다.

**Why this priority**: 토큰이 없으면 각 페이지에서 색상 값이 제각각 되고, 이후 일괄 수정이 불가능해진다. 모든 화면 구현의 전제 조건이다.

**Independent Test**: `tailwind.config.js` 토큰이 정의된 상태에서 임의의 React 컴포넌트를 만들어 `bg-brand`, `text-ink-400`, `rounded-card`, `shadow-cardhover` 클래스를 적용하면 시각적으로 올바르게 렌더링된다.

**Acceptance Scenarios**:

1. **Given** Tailwind config에 토큰이 정의되어 있을 때, **When** 개발자가 `bg-brand`를 클래스로 사용하면, **Then** `#6366F1` 배경색이 렌더링된다.
2. **Given** 카테고리 상수가 정의되어 있을 때, **When** 런타임에 카테고리 문자열 `'기술'`을 전달하면, **Then** 해당 카테고리의 fg/bg/dot 색상 값이 반환된다.
3. **Given** globals.css가 로드된 상태일 때, **When** 요소에 `skel` 클래스를 적용하면, **Then** 좌→우 shimmer 애니메이션이 재생된다.

---

### User Story 2 - 개발자가 데이터 상태에 따른 UI를 컴포넌트 하나로 처리 (Priority: P1)

API 데이터 로딩·에러·빈 상태 처리가 필요한 모든 화면에서 개발자가 동일한 컴포넌트 인터페이스로 세 가지 상태를 모두 표현한다.

**Why this priority**: Constitution §III 조항 "로딩·에러·빈 상태 미처리는 미완성 컴포넌트"가 적용된다. 기반 컴포넌트가 이 패턴을 선행 정의해야 페이지 구현 시 재발명을 막을 수 있다.

**Independent Test**: `StatCard loading={true}` 렌더 시 skeleton이, `loading={false}` 시 실제 수치가 표시되면 이 스토리는 독립적으로 검증된다.

**Acceptance Scenarios**:

1. **Given** StatCard에 `loading={true}`를 전달하면, **When** 컴포넌트가 마운트되면, **Then** 아이콘·라벨·수치 영역 모두 shimmer skeleton으로 대체된다.
2. **Given** EmptyState에 제목과 설명을 전달하면, **When** 렌더링되면, **Then** 중앙 정렬된 빈 상태 메시지와 선택적 CTA 버튼이 fadeup 애니메이션으로 나타난다.
3. **Given** 알 수 없는 카테고리 문자열이 CatBadge에 전달되면, **When** 렌더링되면, **Then** 에러 없이 폴백 색상이 적용된다.

---

### User Story 3 - 개발자가 NewsCard로 기사 목록 렌더링 (Priority: P2)

뉴스 피드, 검색 결과, 트렌드 화면에서 개발자가 `NewsItem` 데이터를 받아 일관된 NewsCard 레이아웃으로 기사를 표시한다.

**Why this priority**: 대시보드 핵심 콘텐츠인 기사 카드가 정의되어야 W-01(대시보드), W-02(트렌드), W-03(편향 분석)에서 재사용할 수 있다.

**Independent Test**: `NewsItem` 목 데이터로 NewsCard를 렌더링해 썸네일·카테고리 뱃지·편향 칩·제목·메타 정보가 모두 출력되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** `bias: -23`인 NewsItem을 NewsCard에 전달하면, **When** 렌더링되면, **Then** "진보 -23" 레이블의 BiasChip이 파란색으로 표시된다.
2. **Given** 긴 제목(3줄 초과)의 NewsItem을 전달하면, **When** 렌더링되면, **Then** 제목이 2줄에서 잘리고 말줄임표로 표시된다.
3. **Given** `onOpen` 콜백이 전달된 NewsCard를, **When** 클릭하면, **Then** 해당 NewsItem 객체를 인자로 콜백이 호출된다.

---

### User Story 4 - 개발자가 Icon 컴포넌트로 아이콘 통일 사용 (Priority: P2)

모든 화면에서 개발자가 SVG 직접 삽입 없이 `<Icon name="..." />` 단일 인터페이스로 44개 이상의 아이콘을 사용한다.

**Why this priority**: 아이콘 시스템이 없으면 SVG 파일이 각 컴포넌트에 산재되어 일관성 관리가 불가능해진다. 이 컴포넌트는 다른 모든 UI 컴포넌트가 의존한다.

**Independent Test**: 지원 목록 44개 이름 각각을 `<Icon name="..." />`으로 렌더링했을 때 모두 아이콘이 표시되고, 목록에 없는 이름은 빈 `<span>`을 반환한다.

**Acceptance Scenarios**:

1. **Given** `name="ghost"`를 Icon에 전달하면, **When** 렌더링되면, **Then** ghost 아이콘이 기본 size=18로 표시된다.
2. **Given** 존재하지 않는 `name="nonexistent"`를 전달하면, **When** 렌더링되면, **Then** 에러 없이 빈 `<span>`이 반환된다.
3. **Given** `size={24} stroke={1.5} className="text-brand"`를 전달하면, **When** 렌더링되면, **Then** 24px 크기, strokeWidth 1.5의 brand 색상 아이콘이 표시된다.

---

### Edge Cases

- 빈 문자열(`''`)을 CatBadge에 전달하면 → 아무것도 렌더링하지 않음 (null 반환)
- `bias: 0`을 BiasChip에 전달하면 → "중립" 레이블만 표시, 수치 미표시
- `bias: -10`, `bias: +10` 경계값을 BiasChip에 전달하면 → 진보/보수 판정 기준 경계 동작 확인
- StatCard에 `delta: 0`을 전달하면 → 증감 표시 없음 또는 ±0% 처리 방식 일관 적용
- `pad={false}`인 Card 안에 차트를 넣으면 → 내부 padding 없이 차트가 카드 엣지까지 채워짐
- ImgPlaceholder에 `ratio` 미전달 시 → 기본 비율(16/8)이나 height 기반 레이아웃으로 자연스럽게 처리

---

## Requirements *(mandatory)*

### Functional Requirements

**토큰**

- **FR-001**: 시스템은 `brand`, `navy`, `canvas`, `ink.*`, `ok`, `warn`, `danger` 색상 토큰을 단일 설정 파일에서 관리해야 한다.
- **FR-002**: 시스템은 `rounded-card`, `rounded-btn`, `shadow-card`, `shadow-cardhover`, `shadow-pop` 형태 토큰을 제공해야 한다.
- **FR-003**: 시스템은 `Pretendard Variable`을 1순위로 하는 `sans`, `display` 폰트 패밀리를 설정해야 한다.
- **FR-004**: 전역 스타일에 `tnum`, `clamp2`, `clamp3`, `fadeup`, `skel`, `stripes` 유틸리티 클래스가 정의되어 있어야 한다.
- **FR-005**: 카테고리 색상(`기술`, `경제`, `정치`, `스포츠`, `문화`)은 런타임 주입을 위해 JS 상수로 관리해야 하며, 알 수 없는 카테고리에 대한 폴백 상수가 별도로 존재해야 한다.

**아이콘 시스템**

- **FR-006**: Icon 컴포넌트는 44개 지정 아이콘을 `name` prop 하나로 렌더링해야 한다.
- **FR-007**: Icon 컴포넌트는 `size`, `stroke`, `className` prop을 지원해야 한다.
- **FR-008**: Icon 컴포넌트는 알 수 없는 `name` 값 입력 시 에러 없이 빈 `<span>`을 반환해야 한다.

**컴포넌트**

- **FR-009**: Card 컴포넌트는 `pad={false}` 시 내부 padding을 제거하고, `hover={true}` 시 마우스오버 시각 피드백을 제공해야 한다.
- **FR-010**: CatBadge는 빈 문자열 입력 시 렌더링하지 않아야 하며, 알 수 없는 카테고리 입력 시 폴백 색상을 사용해야 한다.
- **FR-011**: BiasChip은 score 값에 따라 진보/중립/보수 세 가지 시각 상태를 표시해야 하며, score 0 시 수치를 생략해야 한다.
- **FR-012**: StatCard는 `loading={true}` 시 shimmer skeleton을, `loading={false}` 시 실제 데이터를 렌더링해야 한다.
- **FR-013**: StatCard는 `delta` 양수·음수에 따라 각각 ok 색상(▲)과 danger 색상(▼)으로 증감을 표시해야 한다.
- **FR-014**: Segmented 컴포넌트는 `sm`/`md` 두 가지 사이즈를 지원하고 선택된 탭을 시각적으로 강조해야 한다.
- **FR-015**: StatusDot은 4가지 상태(`running`, `idle`, `warning`, `error`)를 렌더링하며, `running`·`warning`·`error` 상태는 ping 애니메이션을 적용해야 한다.
- **FR-016**: EmptyState는 제목·설명·선택적 CTA를 fadeup 애니메이션으로 표시해야 한다.
- **FR-017**: NewsCard는 썸네일→카테고리 뱃지+편향 칩→제목(2줄 clamp)→메타 정보 순서로 구성되어야 하며, `onOpen` 콜백을 지원해야 한다.

**타입 안전성 (Constitution §IV 준수)**

- **FR-018**: `NewsItem` 인터페이스는 `src/types/news.ts`에 export되어야 한다.
- **FR-019**: `StatCardData` 인터페이스는 별도로 export되어야 한다.
- **FR-020**: 모든 컴포넌트의 props는 명시적 TypeScript interface로 정의되어야 하며 `any` 타입은 금지된다.

**접근성 (Constitution §V 준수)**

- **FR-021**: 모든 인터랙티브 컴포넌트(Segmented, NewsCard)는 키보드 탐색을 지원해야 한다.
- **FR-022**: 아이콘만으로 의미를 전달하는 경우 `aria-label` 또는 시각적으로 숨겨진 텍스트가 있어야 한다.

**테마 전략 결정**

- **FR-023**: v1은 `classic` 단일 테마만 지원한다. `editorial` 테마 분기 코드(`window.__THEME_NAME`)는 포함하지 않는다. 토큰 구조는 향후 테마 확장을 고려해 네임스페이스를 예약해 둔다.

### Key Entities

- **DesignToken**: 색상·간격·그림자·폰트를 단일 설정에서 관리하는 명명된 값. Tailwind config에 등록됨.
- **NewsItem**: 개별 뉴스 기사를 나타내는 공통 데이터 타입. id, title, source, cat, bias, time, reads 필드 포함.
- **StatCardData**: 통계 카드 하나의 표시 데이터. label, sub, value, delta, fmt, icon, tone 포함.
- **CAT_COLOR**: 카테고리명 → fg/bg/dot 색상 매핑 상수. 런타임 style 주입용.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 임의의 개발자가 토큰 이름만 알면 별도 CSS 파일 없이 새 페이지 UI를 구성할 수 있다 (커스텀 색상 값 하드코딩 0건).
- **SC-002**: 10개 공유 컴포넌트 각각이 로딩·정상·빈 상태 세 가지를 모두 시각적으로 표현한다.
- **SC-003**: 지정 44개 아이콘이 모두 Icon 컴포넌트를 통해 에러 없이 렌더링된다.
- **SC-004**: 모든 컴포넌트 파일이 TypeScript strict 모드에서 타입 에러 0건으로 통과된다.
- **SC-005**: 이 스펙의 산출물이 완성된 이후 002(레이아웃) 스펙 작업이 시작된다 — 순서 역전 없음.
- **SC-006**: NewsCard, CatBadge, BiasChip의 엣지 케이스(빈 문자열, 경계값, 폴백) 모두 에러 없이 렌더링된다.

---

## Assumptions

- 다크 모드는 v1 범위 밖이다. Tailwind `dark:` 클래스 구조는 향후 대응을 위해 예약하나 현재 구현 의무는 없다.
- `Pretendard Variable` 폰트는 CDN 또는 로컬 파일로 프로젝트에 주입된다고 가정한다 (이 스펙의 범위 밖).
- `lucide-react` 패키지를 신규 의존성으로 추가한다. Constitution §"Third-Party Library Criteria" 기준 충족: 주간 수백만 다운로드, 번들 tree-shaking 지원, MIT 라이선스.
- `arrowleft`, `chevright`, `spark2` 등 lucide에 없는 커스텀 아이콘은 별도 상수 파일로 SVG path를 관리한다.
- `ImgPlaceholder`는 실제 이미지 API 연동 전 프로토타입용 컴포넌트로, API 연동 시 교체된다.
- 카테고리 목록(기술·경제·정치·스포츠·문화) 5종은 고정이다. 서버에서 동적으로 내려오는 카테고리에 대한 대응은 이 스펙 범위 밖이다.
- `inline style` prop이 카테고리 색상 주입에만 예외적으로 허용된다 (Constitution Styling 규칙의 단일 예외 — 런타임 동적 색상값은 Tailwind 임의값 구문으로 표현할 수 없기 때문).
