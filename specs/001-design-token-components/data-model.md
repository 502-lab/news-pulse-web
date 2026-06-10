# Data Model: 디자인 토큰 & 공유 UI 컴포넌트 시스템

**Phase**: 1 — Design & Contracts
**Date**: 2026-06-10

---

## 핵심 데이터 타입

### NewsItem

기사 한 건을 나타내는 공통 타입. API 응답에서 내려오는 뉴스 데이터 구조.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | `string` | ✅ | 기사 고유 ID |
| `title` | `string` | ✅ | 기사 제목 |
| `source` | `string` | ✅ | 언론사명 |
| `cat` | `string` | ✅ | 카테고리 (기술/경제/정치/스포츠/문화 또는 미지값) |
| `bias` | `number` | ✅ | 편향 점수 (정수, 음수=진보 / 양수=보수 / ±10 이내=중립) |
| `time` | `string` | ✅ | 상대 시간 문자열 (예: "3시간 전") |
| `reads` | `number` | ✅ | 조회 수 |
| `summary` | `string` | ❌ | AI 요약 (optional) |
| `content` | `string` | ❌ | 전체 본문 (optional) |

**파일**: `src/types/news.ts`

**관계**: `NewsItem.cat` → `CAT_COLOR[cat]` (런타임 조회, 없으면 `CAT_FALLBACK`)

---

### StatCardData

통계 카드 하나의 표시 데이터. 대시보드 통계 섹션(W-01)에서 사용.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `label` | `string` | ✅ | 지표명 (예: "오늘의 기사") |
| `sub` | `string` | ✅ | 부제 (예: "전일 대비") |
| `value` | `number` | ✅ | 수치 |
| `delta` | `number` | ✅ | 증감율 (%, 양수=상승/ok색, 음수=하락/danger색) |
| `fmt` | `'int' \| 'pct'` | ✅ | 표시 형식 (정수 또는 퍼센트) |
| `icon` | `string` | ✅ | Icon name (예: "activity") |
| `tone` | `'brand' \| 'cyan' \| 'ok' \| 'warn'` | ✅ | 아이콘 색조 |

**파일**: `src/types/news.ts` (NewsItem과 같은 파일)

---

## 상수 데이터

### CAT_COLOR

런타임 카테고리 색상 조회 테이블.

| 카테고리 | fg | bg | dot |
|---------|----|----|-----|
| 기술 | `#4548C9` | `#EEF0FF` | `#6366F1` |
| 경제 | `#0E7490` | `#ECFEFF` | `#06B6D4` |
| 정치 | `#B45309` | `#FFF7ED` | `#F59E0B` |
| 스포츠 | `#047857` | `#ECFDF5` | `#10B981` |
| 문화 | `#BE185D` | `#FDF2F8` | `#EC4899` |

### CAT_FALLBACK

알 수 없는 카테고리에 적용되는 기본값: `{ fg: '#475569', bg: '#F1F5F9', dot: '#94A3B8' }`

**파일**: `src/constants/categories.ts`

---

## 디자인 토큰

### 색상 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `brand.DEFAULT` | `#6366F1` | 주요 액션, 링크, 강조 |
| `brand.soft` | `#EEF0FF` | brand 배경 틴트 |
| `brand.deep` | `#4548C9` | brand 어두운 변형 |
| `navy` | `#0F172A` | 최상위 텍스트 |
| `canvas` | `#faf9f5` | 페이지 배경 |
| `ink.DEFAULT` | `#0F172A` | 기본 텍스트 |
| `ink.600` | `#475569` | 서브 텍스트 |
| `ink.500` | `#64748B` | 플레이스홀더 |
| `ink.400` | `#94A3B8` | 비활성 텍스트 |
| `ink.200` | `#E2E8F0` | 구분선 |
| `ink.100` | `#F1F5F9` | 배경 틴트 |
| `ink.50` | `#F8FAFC` | 최밝은 배경 |
| `ok.DEFAULT` | `#10B981` | 성공, 증가 |
| `ok.soft` | `#ECFDF5` | ok 배경 틴트 |
| `warn.DEFAULT` | `#F59E0B` | 경고 |
| `warn.soft` | `#FFF7ED` | warn 배경 틴트 |
| `danger` | `#EF4444` | 에러, 감소 |

### 형태 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `rounded-card` | `12px` | 카드 컴포넌트 |
| `rounded-btn` | `8px` | 버튼, 배지, Segmented |
| `shadow-card` | `0 1px 4px rgba(0,0,0,0.08)` | 기본 카드 그림자 |
| `shadow-cardhover` | `0 4px 16px rgba(99,102,241,0.12)` | hover 시 카드 그림자 |
| `shadow-pop` | `0 8px 32px rgba(0,0,0,0.16)` | 팝오버, 드롭다운 |

---

## 컴포넌트 상태 모델

### BiasChip 상태 머신

```
bias ≤ -10  → 진보 (파란색)
bias 0      → 중립 (수치 미표시)
-10 < bias < +10 → 중립 (회색)
bias ≥ +10  → 보수 (빨간색)
```

### StatusDot 상태

```
running  → green + ping 애니메이션
idle     → gray (정적)
warning  → amber + ping 애니메이션
error    → red + ping 애니메이션
```

### StatCard loading 전환

```
loading=true  → 스켈레톤 (shimmer)
loading=false → 실제 데이터 (value, delta, icon)
```
