# Quickstart: 레이아웃 & 네비게이션 셸

**Branch**: `002-layout-nav-shell` | **Date**: 2026-06-11

---

## Prerequisites

- Node.js 20+, pnpm 설치됨
- `pnpm install` 완료
- `react-router-dom` 설치됨 (`pnpm add react-router-dom`)

---

## Dev Server 실행

```bash
pnpm dev
# → http://localhost:5173
```

---

## 검증 시나리오

아래 시나리오는 `src/store/auth.mock.ts`의 `useAuthStore` 반환값을 수정해 테스트한다.

### S-01: 기본 레이아웃 확인 (role=USER, isLoading=false)

`auth.mock.ts` 기본값 그대로 사용.

1. `http://localhost:5173/` 접근
2. **Expected**: 좌측에 Sidebar(240px navy), 우측에 "대시보드 — 003에서 구현" 텍스트
3. Sidebar 상단: spark2 아이콘 + "NewsPulse" 텍스트
4. Sidebar nav: "대시보드", "트렌드 분석", "편향 분석" 3개 항목
5. "대시보드" 항목이 활성 스타일(`bg-brand/20 text-brand`)
6. Sidebar 하단: "테스트유저" 닉네임 + "로그아웃" 버튼

### S-02: 네비게이션 이동 + 활성 스타일

1. Sidebar의 "트렌드 분석" 클릭
2. **Expected**: URL `/trends`로 변경, "트렌드 분석" NavItem 활성 스타일, "대시보드" 비활성 스타일
3. 다시 "대시보드" 클릭 → URL `/`, "대시보드" 다시 활성

### S-03: 공개 경로 (Sidebar 없음)

1. `http://localhost:5173/login` 직접 접근
2. **Expected**: Sidebar 없이 "로그인 — 007에서 구현" 텍스트만 표시

### S-04: 404 페이지

1. `http://localhost:5173/존재안하는경로` 접근
2. **Expected**: 404 텍스트, "페이지를 찾을 수 없습니다." 메시지, "홈으로 돌아가기" 링크 (Sidebar 없음)

### S-05: FullPageSpinner (isLoading=true)

`auth.mock.ts`를 아래와 같이 임시 수정:
```ts
isLoading: true,
user: null,
```
1. `http://localhost:5173/` 접근
2. **Expected**: Sidebar 없이 중앙에 회전하는 스피너만 표시
3. 테스트 후 원복.

### S-06: ADMIN 라우팅 (USER mock → 리다이렉트)

기본 `role: 'USER'` 상태:
1. `http://localhost:5173/admin/monitor` 직접 접근
2. **Expected**: `/`로 즉시 리다이렉트, DashboardPage placeholder 표시

### S-07: ADMIN 라우팅 (ADMIN mock → 접근 허용)

`auth.mock.ts`를 임시 수정:
```ts
role: 'ADMIN',
```
1. `http://localhost:5173/admin/monitor` 접근
2. **Expected**: "시스템 모니터링 — 006에서 구현" 표시
3. Sidebar에 5개 항목 표시 (대시보드, 트렌드 분석, 편향 분석, 시스템 모니터링, 사용자 관리)
4. 테스트 후 원복.

### S-08: 새로고침 시 경로 유지

1. `/trends`로 이동
2. 브라우저 새로고침 (F5 또는 Cmd+R)
3. **Expected**: `/trends` 유지, TrendsPage placeholder 표시

---

## TypeScript 에러 확인

```bash
pnpm tsc --noEmit
# 에러 0개여야 함
```

---

## 참조

- 데이터 모델: [data-model.md](./data-model.md)
- 연구 결과: [research.md](./research.md)
- 스펙: [spec.md](./spec.md)
