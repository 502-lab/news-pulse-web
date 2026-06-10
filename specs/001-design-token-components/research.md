# Research: 디자인 토큰 & 공유 UI 컴포넌트 시스템

**Phase**: 0 — Outline & Research
**Date**: 2026-06-10
**Status**: Complete (NEEDS CLARIFICATION 0건)

---

## 결정 사항

### D-01 · 아이콘 시스템: lucide-react + 커스텀 상수

**Decision**: `lucide-react` 패키지를 기본 아이콘 소스로 사용하고, lucide에 없는 커스텀 아이콘(`arrowleft`, `chevright`, `spark2` 등)은 SVG path 상수 파일로 별도 관리한다.

**Rationale**:
- lucide-react는 MIT 라이선스, 주간 수백만 다운로드, tree-shaking 지원으로 Constitution §"Third-Party Library Criteria" 세 가지 기준을 모두 충족한다.
- 커스텀 path를 일부 유지해야 하므로, Icon 컴포넌트 내부에서 `lucide-react` 컴포넌트 map과 커스텀 SVG map을 합산 조회하는 방식으로 통합한다.
- 알 수 없는 name은 에러 없이 빈 `<span>` 반환 — 미래 아이콘 추가 시 화면 깨짐 없음.

**Alternatives considered**:
- 전체 커스텀 SVG 테이블: 유지 비용 높음, lucide 아이콘 업데이트 혜택 없음
- `@radix-ui/react-icons`: 아이콘 수가 적고 커스텀 확장이 어려움

---

### D-02 · 테마 전략: classic 단일 테마 (v1)

**Decision**: v1에서는 `classic`(인디고 SaaS) 테마만 지원. `editorial` 테마 분기 코드(`window.__THEME_NAME`) 미포함. Tailwind 토큰은 향후 테마 확장을 고려한 네임스페이스 구조로 정의하되 실제 스위칭 구현은 생략.

**Rationale**:
- editorial 테마 지원은 CSS 변수 스위칭 전략 결정, 별도 토큰 세트, data-theme attribute 핸들링 등 추가 복잡도를 수반한다.
- v1 목표는 7개 화면 구현이므로 테마 스위칭은 우선순위 밖.
- 토큰을 `brand`, `ink`, `ok`, `warn`, `danger` 네임스페이스로 정의하면 나중에 editorial 값으로 재매핑이 용이하다.

**Alternatives considered**:
- 두 테마 동시 지원: CSS 변수 레이어 + data-theme 구현 필요 → v1 over-engineering
- `window.__THEME_NAME` 런타임 분기: 번들에 editorial 값이 포함되어 용량 낭비

---

### D-03 · 카테고리 색상: JS 상수 + 런타임 inline style 주입

**Decision**: `CAT_COLOR` 레코드를 `src/constants/categories.ts`에 정의하고, CatBadge에서 `style={{ color: fg, backgroundColor: bg }}` 형태로 직접 주입한다.

**Rationale**:
- 카테고리 문자열은 API에서 런타임에 내려오는 동적 값이다. Tailwind JIT는 빌드 타임에 클래스명을 스캔하므로 `bg-[#EEF0FF]` 같은 임의값 클래스는 동적 string interpolation으로는 생성되지 않는다.
- Constitution §Styling은 inline style을 금지하지만, spec의 Assumptions 섹션에 이 단일 예외가 명시적으로 근거와 함께 문서화되어 있다.
- 5개 고정 카테고리 외 미지의 카테고리에는 `CAT_FALLBACK`을 사용해 에러 없이 폴백.

**Alternatives considered**:
- CSS 변수 접근법: `--cat-fg` 등을 전역 CSS에 등록 → 카테고리 수 증가 시 전역 CSS 관리 복잡도 증가
- Tailwind safelist: 모든 카테고리 색상 클래스를 safelist에 명시 → 새 카테고리 추가마다 config 수정 필요, 동적 확장 불가

---

### D-04 · Pretendard 폰트 로딩: CDN

**Decision**: `index.html`에 jsDelivr CDN 링크를 추가해 Pretendard Variable 폰트를 로드한다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
```

**Rationale**:
- npm으로 설치 가능한 Pretendard Variable 패키지가 없거나 공식 지원이 제한적이다.
- CDN은 캐싱 효율이 좋고 별도 폰트 파일을 레포에 커밋할 필요가 없다.
- Tailwind `fontFamily.sans`의 첫 번째 항목으로 등록하면 브라우저 폴백 체인(Pretendard → Inter → system-ui)이 자동으로 동작한다.

**Alternatives considered**:
- 로컬 폰트 파일 커밋: 폰트 파일(.woff2) 수 MB 추가, 업데이트 번거로움
- Google Fonts: Pretendard가 Google Fonts에 없음

---

### D-05 · clamp3 유틸리티 독립성 주의

**Decision**: `globals.css`에 `.clamp3`를 `.clamp2`와 독립적으로 정의한다. `-webkit-line-clamp: 3`만 단독으로는 동작하지 않으므로 `-webkit-box` 설정을 포함한다.

```css
.clamp3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Rationale**: spec 원문의 `.clamp3 { -webkit-line-clamp: 3; }` 표기는 `.clamp2`를 상속하는 것처럼 보이나 CSS에서는 상속되지 않는다. 독립 클래스로 정의해야 올바르게 동작한다.

---

## 해결된 NEEDS CLARIFICATION

없음 — 입력 스펙에서 모든 결정이 명시적으로 내려짐.
