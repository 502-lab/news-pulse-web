# Research: 003 메인 대시보드 (W-01)

**Date**: 2026-06-12 | **Branch**: `003-main-dashboard`

---

## 파일 스캔 결과

### 1. ErrorBoundary 존재 여부

- **결과**: `src/components/common/ErrorBoundary.tsx` **없음**
- `src/components/common/`에는 `FullPageSpinner.tsx`만 존재
- **결정**: 003-01(Setup)에서 신규 생성

### 2. 패키지 설치 여부

| 패키지 | 상태 | 조치 |
|--------|------|------|
| `clsx` | ❌ NOT INSTALLED | `pnpm add clsx` |
| `recharts` | ❌ NOT INSTALLED | `pnpm add recharts` |
| `date-fns` | ❌ NOT INSTALLED | `pnpm add date-fns` |

### 3. DashboardPage import 방식

- `src/router.tsx` 4번째 줄: `import DashboardPage from '@/pages/DashboardPage';` — **eager import**
- **결정**: Phase 5에서 `React.lazy` + `Suspense` (fallback: `<FullPageSpinner />`)로 교체

### 4. Icon.tsx LUCIDE_MAP 누락 아이콘

| 아이콘 | 사용처 | 상태 |
|--------|--------|------|
| `Newspaper` | StatCard — 오늘의 뉴스 수 | ❌ 미등록 |
| `Tag` | StatCard — 모니터링 키워드 수 | ❌ 미등록 |
| `FileText` | StatCard — 분석된 기사 수 | ✅ 이미 import됨 (`file`, `article` 별칭 있음) |
| `Scale` | StatCard — 평균 편향 점수 | ✅ 이미 등록됨 |
| `ArrowUpRight` / `ArrowDownRight` | delta 방향 화살표 | ❌ 미등록 (`ArrowRight`만 있음) |
| `Minus` | delta=0 표시 | ❌ 미등록 |

- **결정**: `Newspaper`, `Tag`, `ArrowUpRight`, `ArrowDownRight`, `Minus` 를 003-01에서 추가

### 5. constants/category.ts 존재 여부

- **결과**: **없음** (`src/constants/`에는 `nav.ts`만 존재)
- **결정**: 003-01(Setup)에서 신규 생성 — 6개 카테고리 색상/레이블 매핑

### 6. 기존 verify 스크립트 패턴

- `scripts/verify-002.mjs`: `puppeteer-core` + 시스템 Chrome 사용
- 파일 수정 패턴: auth.mock.ts 수정 → 2800ms 대기 → `page.goto()` → try/finally 원복
- **결정**: verify-003.mjs도 동일 패턴 사용. dashboard.mock.ts 수정으로 에러/빈 상태 시뮬레이션

---

## 기술 결정

### TDec-01: mock 딜레이 구현 방식

- **결정**: `setTimeout(resolve, 500)` + `Promise` 래핑
- **근거**: 스켈레톤 UI 동작 검증을 위해 500ms 딜레이 필수. TanStack Query 미도입 단계이므로 단순 `useState` + `useEffect` 구현
- **대안**: TanStack Query의 `placeholderData` — 이후 스프린트에서 교체 대상

### TDec-02: ErrorBoundary 적용 단위

- **결정**: 섹션별 독립 적용 (StatCard 그리드 / 카테고리 차트 / 뉴스 피드 각각)
- **근거**: Constitution III — 한 영역 에러가 페이지 전체를 크래시하면 안 됨. 독립 재시도 가능해야 함
- **대안**: 페이지 전체 단일 ErrorBoundary — 하나의 에러가 전체 UI를 가리므로 UX 불량

### TDec-03: 썸네일 fallback 구현

- **결정**: `onError` 핸들러로 `useState` 플래그 토글 + null 체크 분리
- **근거**: (1) URL 자체가 null/undefined → 조건부로 img 렌더하지 않고 fallback 바로 렌더 (2) URL 있지만 이미지 로드 실패 → `onError`로 fallback 전환
- **대안**: `onError`만 사용 — null URL 케이스에서 broken img icon이 잠깐 노출되는 문제

### TDec-04: React.lazy + Suspense 위치

- **결정**: AppShell의 `<main>` 내부에 `Suspense` 배치 — router.tsx 전체가 아닌 페이지 컴포넌트만 lazy
- **구현**:
  ```tsx
  // AppShell.tsx에 Suspense 추가
  <main className="flex-1 overflow-y-auto">
    <Suspense fallback={<FullPageSpinner />}>
      <Outlet />
    </Suspense>
  </main>
  ```
  - router.tsx는 `React.lazy`로 교체
- **근거**: 각 페이지가 독립적으로 lazy load되고, Sidebar는 항상 즉시 렌더됨

### TDec-05: 카테고리 배지 색상 관리

- **결정**: `src/constants/category.ts` 신규 생성 — 6개 카테고리 Tailwind 클래스 매핑
- **근거**: CLAUDE.md — "카테고리 뱃지 색상은 constants/category.ts에서 중앙 관리"
- **형태**: `Record<string, { label: string; className: string }>`
