# Quickstart: 003 메인 대시보드 (W-01)

**Branch**: `003-main-dashboard` | **Date**: 2026-06-12

---

## Prerequisites

- `pnpm install` 완료
- `clsx`, `recharts`, `date-fns` 설치됨 (`pnpm add clsx recharts date-fns`)
- `pnpm dev` → `http://localhost:5173` 실행 중

---

## Dev Server 실행

```bash
pnpm dev
# → http://localhost:5173
```

---

## 검증 시나리오 (S-01 ~ S-07)

자동 검증 스크립트: `scripts/verify-003.mjs`

---

### S-01: StatCard 4종 기본 렌더링

1. `http://localhost:5173/` 접근
2. **Expected**:
   - "오늘의 뉴스 수", "분석된 기사 수", "평균 편향 점수", "모니터링 중인 키워드 수" 카드 4개 표시
   - 각 카드에 수치와 delta 표시
   - 로딩 완료 후 스켈레톤 제거

---

### S-02: StatCard delta 색상 구분

1. `http://localhost:5173/` 접근 + 로딩 완료 대기
2. **Expected**:
   - delta 양수(오늘의 뉴스 수 +23): 초록색 클래스(`text-green-*`) 포함
   - delta 음수(평균 편향 점수 -0.3): 빨간색 클래스(`text-red-*`) 포함
   - delta 0(모니터링 키워드 수): 회색 클래스(`text-gray-*`) 포함

---

### S-03: 카테고리 바차트 6개 항목

1. `http://localhost:5173/` 접근 + 로딩 완료 대기
2. **Expected**:
   - Recharts BarChart 렌더링 (`recharts-wrapper` 또는 SVG 존재)
   - 6개 카테고리 레이블(정치/경제/사회/기술/문화/스포츠) 중 최소 하나 이상 텍스트 포함

---

### S-04: 뉴스 피드 10개 카드 렌더링

1. `http://localhost:5173/` 접근 + 로딩 완료 대기
2. **Expected**:
   - 뉴스 카드 10개 렌더링 (article 또는 li 요소)
   - 각 카드에 제목(텍스트), 출처, 카테고리 배지 포함

---

### S-05: 뉴스 카드 클릭 → `/articles/:id` 이동

1. 첫 번째 뉴스 카드 클릭
2. **Expected**: URL이 `/articles/` 로 시작하는 경로로 이동

---

### S-06: 에러 상태 (dashboard.mock.ts 수정)

`src/mocks/dashboard.mock.ts`를 임시 수정하여 `fetchCategoryChart`가 에러를 throw하도록 변경:
```ts
// 임시 수정
export async function fetchCategoryChart(): Promise<CategoryData[]> {
  await delay(500);
  throw new Error('mock error');
}
```
1. `http://localhost:5173/` 접근
2. **Expected**: 카테고리 차트 영역에 "데이터를 불러올 수 없습니다." + 재시도 버튼 표시
3. 재시도 버튼 클릭 → 동일 에러 재표시 (refetch 동작 확인)
4. 테스트 후 원복.

---

### S-07: 빈 상태 (dashboard.mock.ts 수정)

`src/mocks/dashboard.mock.ts`를 임시 수정하여 `fetchNewsFeed`가 빈 배열 반환:
```ts
export async function fetchNewsFeed(): Promise<NewsItem[]> {
  await delay(500);
  return [];
}
```
1. `http://localhost:5173/` 접근
2. **Expected**: 뉴스 피드 영역에 "표시할 뉴스가 없습니다." + 아이콘 표시
3. 테스트 후 원복.

---

## TypeScript 에러 확인

```bash
pnpm tsc --noEmit
# 에러 0개여야 함
```

---

## 자동 검증 실행

```bash
# dev server 실행 중 상태에서
node scripts/verify-003.mjs
```

---

## 참조

- 데이터 모델: [data-model.md](./data-model.md)
- 연구 결과: [research.md](./research.md)
- 스펙: [spec.md](./spec.md)
