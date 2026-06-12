# Design Handoff 분석 — Newsift

**소스**: `~/Downloads/design_handoff_newsift/`
**기준일**: 2026-06-12
**핸드오프 SoT**: 충돌 시 핸드오프 자료 우선

---

## 1. 디자인 시스템 반영 현황

### 핸드오프 정의 토큰 vs 현재 `index.css @theme`

#### 1.1 컬러 — 원시 팔레트

| 토큰 | 핸드오프 Hex | 현재 값 | 상태 |
|---|---|---|---|
| `brand` | `#6366F1` | `#6366f1` | ✅ 일치 |
| `brand-50` | `#EEF0FF` | `brand-soft: #eef0ff` (이름 다름) | ⚠️ 이름 불일치 |
| `brand-100` | `#E0E2FF` | 없음 | ❌ 누락 |
| `brand-600` | `#5457E5` | 없음 | ❌ 누락 |
| `brand-700` | `#4548C9` | `brand-deep: #4548c9` (이름 다름) | ⚠️ 이름 불일치 |
| `cyan` | `#06B6D4` | 없음 | ❌ 누락 |
| `ink` | `#0F172A` | `#0f172a` | ✅ 일치 |
| `ink-700` | `#334155` | 없음 | ❌ 누락 |
| `ink-500` | `#64748B` | `#64748b` | ✅ 일치 |
| `ink-400` | `#94A3B8` | `#94a3b8` | ✅ 일치 |
| `ink-300` | `#CBD5E1` | 없음 | ❌ 누락 |
| `ink-200` | `#E2E8F0` | `#e2e8f0` | ✅ 일치 |
| `ink-100` | `#F1F5F9` | `#f1f5f9` | ✅ 일치 |
| `ink-50` | (implicit `#F8FAFC`) | `#f8fafc` | ✅ 존재 (이름: ink-50) |
| `canvas` | `#F8FAFC` | `#faf9f5` | ❌ 값 다름 (+살짝 웜) |
| `navy` | `#0F172A` | `#0f172a` | ✅ 일치 |
| `navy-800` | `#1E293B` | 없음 | ❌ 누락 |
| `navy-700` | `#334155` | 없음 | ❌ 누락 |
| `navy-600` | `#475569` | 없음 | ❌ 누락 |
| `ok` | `#10B981` | `#10b981` | ✅ 일치 |
| `ok-soft` | `#ECFDF5` | `#ecfdf5` | ✅ 일치 |
| `warn` | `#F59E0B` | `#f59e0b` | ✅ 일치 |
| `warn-soft` | `#FFF7ED` | `#fff7ed` | ✅ 일치 |
| `danger` | `#EF4444` | `#ef4444` | ✅ 일치 |
| `danger-tint` | `#FEF2F2` | 없음 | ❌ 누락 |

**카테고리 색상 토큰** (CSS 변수가 아닌 JS constants/category.ts 관리 — 핸드오프 의도와 일치):
- 현재 `src/constants/category.ts` 존재 → 별도 확인 필요

**세컨더리 틴트 토큰** (완전 누락):
- `color-success-tint` `#ECFDF5`, `color-warning-tint` `#FFF7ED`, `color-secondary-tint` `#ECFEFF`

#### 1.2 Radius

| 토큰 | 핸드오프 값 | 현재 값 | 상태 |
|---|---|---|---|
| `radius-card` | **8px** | **12px** | ❌ 불일치 (+4px) |
| `radius-btn` | **6px** | **8px** | ❌ 불일치 (+2px) |
| `radius-input` | **4px** | 없음 | ❌ 누락 |
| `radius-lg` | `12px` | 없음 | ❌ 누락 |
| `radius-2xl` | `16px` | 없음 | ❌ 누락 |

> **핵심 수정**: `--radius-card: 8px`, `--radius-btn: 6px` 로 변경 필수. 현재 값이 둘 다 과도하게 큼.

#### 1.3 Shadow

| 토큰 | 핸드오프 값 | 현재 값 | 상태 |
|---|---|---|---|
| `shadow-card` | `0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)` | `0 1px 4px rgba(0,0,0,0.08)` | ❌ 불일치 |
| `shadow-cardhover` | `0 2px 4px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.08)` | `0 4px 16px rgba(99,102,241,0.12)` | ❌ 불일치 (브랜드 컬러 그림자 → 핸드오프는 네이비 기반) |
| `shadow-pop` | `0 8px 28px rgba(15,23,42,.16)` | `0 8px 32px rgba(0,0,0,0.16)` | ⚠️ 근사값 |

#### 1.4 타이포그래피

| 항목 | 핸드오프 | 현재 | 상태 |
|---|---|---|---|
| Primary font | `Pretendard Variable` | `Pretendard Variable` (CDN 로드 ✅) | ✅ 일치 |
| Latin/numeric | `Inter` | 미지정 (system-ui fallback) | ⚠️ Inter 누락 |
| Fallback | `Noto Sans KR` → `system-ui` | `system-ui` | ⚠️ Noto Sans KR 누락 |
| `tnum` utility | 정의됨 | 정의됨 ✅ | ✅ 일치 |
| `clamp2/3` utility | 정의됨 | 정의됨 ✅ | ✅ 일치 |
| px 스케일 CSS vars | 별도 토큰 없이 인라인 클래스 사용 | 없음 | — (구현자 판단) |

#### 1.5 모션 / 애니메이션

| 항목 | 핸드오프 | 현재 | 상태 |
|---|---|---|---|
| `fadeup` | `translateY(8px)→0, 0.34s cubic-bezier(.2,.7,.3,1)` | `translateY(6px)→0, 0.18s ease` | ⚠️ 불일치 (속도 2× 빠름, easing 다름) |
| `shimmer` (skel) | 1.4s linear, `#eef1f6→#e2e8f0` | 1.4s ✅, `#f1f5f9→#e2e8f0` | ⚠️ 시작 색 미세 차이 |
| `stripes` | 135° `#e2e8f0/#eef1f6` | -45° `#f1f5f9/#e9edf2` | ⚠️ 각도·색 미세 차이 |

#### 1.6 tailwind.config.ts에 추가/수정 필요한 내용

```css
@theme {
  /* 누락 토큰 추가 */
  --color-brand-50: #eef0ff;    /* brand-soft → brand-50 로 rename */
  --color-brand-100: #e0e2ff;
  --color-brand-600: #5457e5;
  --color-brand-700: #4548c9;   /* brand-deep → brand-700 로 rename */
  --color-cyan: #06b6d4;
  --color-ink-700: #334155;
  --color-ink-300: #cbd5e1;
  --color-navy-800: #1e293b;
  --color-navy-700: #334155;
  --color-navy-600: #475569;
  --color-danger-tint: #fef2f2;
  --color-success-tint: #ecfdf5;
  --color-warning-tint: #fff7ed;
  --color-secondary-tint: #ecfeff;

  /* 값 수정 */
  --color-canvas: #f8fafc;       /* 현재 #faf9f5 → 핸드오프 #f8fafc */
  --radius-card: 8px;             /* 현재 12px → 8px */
  --radius-btn: 6px;              /* 현재 8px → 6px */
  --radius-input: 4px;            /* 신규 */
  --radius-lg: 12px;
  --radius-2xl: 16px;
  --shadow-card: 0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06);
  --shadow-cardhover: 0 2px 4px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.08);
  --shadow-pop: 0 8px 28px rgba(15,23,42,.16);

  /* 폰트 fallback 보강 */
  --font-sans: "Pretendard Variable", Inter, "Noto Sans KR", system-ui, sans-serif;
}

/* fadeup 수정 */
@keyframes fadeup {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fadeup { animation: fadeup 0.34s cubic-bezier(.2,.7,.3,1) both; }
```

---

## 2. 화면별 구현 갭

### 핸드오프 전체 화면 목록

| ID | 화면명 | 현재 대응 경로 | 대응 컴포넌트 | 갭 요약 |
|---|---|---|---|---|
| W-08 | 로그인 | `/login` → `LoginPage.tsx` | ✅ 존재 | split navy 패널 없음, Demo Role 버튼 없음, Apple 소셜 없음 |
| W-09 | 회원가입 | `/register` → `RegisterPage.tsx` | ✅ 존재 | 비밀번호 strength meter 없음, 소셜 회원가입 없음, 전체 동의 체크박스 구조 미확인 |
| W-10 | 비밀번호 찾기 | `/forgot` → `ForgotPage.tsx` | ✅ 존재 | 전송 후 완료 상태 UI 미확인 |
| W-11 | 소셜 동의 시트 | 없음 | ❌ 미존재 | `ConsentDialog` 컴포넌트 전체 누락 |
| W-12 | 온보딩 | 없음 | ❌ 미존재 | 5단계 플로우, step rail, RadioCard 전부 없음 |
| L-01/02 | 약관/개인정보 | `/terms`, `/privacy` | ✅ 존재 | 2-col 목차 구조 미확인 |
| W-U-01 | 뉴스 홈 (USER) | `/` → `DashboardPage.tsx` | ⚠️ 부분 | **레이아웃 구조 완전 다름** (핸드오프: USER GNB + 8:4 그리드; 현재: 좌측 Sidebar + 단일 컬럼) |
| W-02 | 트렌드 | `/trends` → `TrendsPage.tsx` | ⚠️ 부분 | 히트맵, 이슈 카드, 워드클라우드 차트 구현 여부 미확인 |
| W-03 | 편향분석 | `/bias` → `BiasPage.tsx` | ⚠️ 부분 | DivergingBars, BiasSpectrum 차트 구현 여부 미확인 |
| W-U-05 | 내 인사이트 | 없음 | ❌ 미존재 | 라우트 `/insights` 없음 |
| W-U-06 | 주간 브리핑 | 없음 | ❌ 미존재 | 라우트 `/weekly` 없음 |
| W-04 | 기사 상세 | `/articles/:id` → `ArticleDetailPage.tsx` | ⚠️ 부분 | AI 요약 패널, 편향 분석 사이드 패널, 관련기사 미확인 |
| W-U-02 | 기사 비교 | 없음 | ❌ 미존재 | 3-col 비교 레이아웃 전체 없음 |
| 검색/리스트 | 검색 결과 | 없음 | ❌ 미존재 | 범용 ArticleListScreen 없음 |
| W-A-01 | 운영 대시보드 | `/admin/monitor` → `MonitorPage.tsx` | ⚠️ 부분 | API 사용량 progress bar, 스케줄러 상태, 오류 로그 테이블 구현 여부 미확인 |
| W-A-02 | 뉴스 수집 관리 | 없음 | ❌ 미존재 | `/admin/ingestion` 라우트 없음 |
| W-A-05 | 콘텐츠 분석 | 없음 | ❌ 미존재 | `/admin/content` 라우트 없음 |
| W-07 | 사용자 관리 | `/admin/users` → `UsersPage.tsx` | ⚠️ 부분 | Role 드롭다운, stat 카드 4종, 아바타 글자 버블 미확인 |
| W-A-04 | 공지/알림 | 없음 | ❌ 미존재 | `/admin/notice` 라우트 없음 |

### 핵심 시각적 차이

#### W-U-01 뉴스 홈 (가장 큰 갭)
- **핸드오프**: USER는 상단 GNB(탭 5개 + 검색 + 벨 + 아바타), `max-w-[1320px]` 가운데 정렬, `col-8/col-4` 그리드
- **현재**: 좌측 navy Sidebar 240px + 단일 컬럼 콘텐츠
- **구조 전면 재설계 필요**: USER 레이아웃(`UserLayout`) vs ADMIN 레이아웃(`AdminLayout`) 분리가 핵심

#### W-U-01 속보 배너 + 카테고리 탭
- navy dark 카드 속보 배너 없음
- pill 탭 (brand fill / white border) 방식 카테고리 필터 없음
- 북마크 토글 (우상단 pill, brand fill) 없음
- AI 요약 1줄 + "AI" chip 없음
- 오른쪽 위젯 패널 (키워드 Top5, 속보 타임라인, AI 브리핑) 없음

#### ADMIN 레이아웃
- navy sidebar 240px → **현재 구현과 일치**. 단, 상단에 화면코드 뱃지 + 타이틀 + "시스템 정상" pill + ADMIN 역할 뱃지가 있는 top bar가 없음

---

## 3. Spec Kit 수정 필요 여부

### constitution.md 충돌/보완 사항

| 조항 | 현황 | 권장 |
|---|---|---|
| **Styling: `inline style` 금지** | constitution §Styling: "Inline style props are prohibited" | 001 spec.md에서 카테고리 색상 런타임 주입에 예외 허용 명시됨 → constitution에도 단일 예외 조항 추가 필요 |
| **반응형** | constitution: mobile(<768)/tablet(768~1279)/desktop(≥1280) 3단계 | 핸드오프: 1440px 데스크탑 우선, lg+(1024) 이상에서만 일부 요소 표시. 모바일은 범위 밖. **constitution의 mobile 타깃과 충돌** |
| **Dark mode** | constitution: `dark:` 클래스 "구현해야 함" 암시 | 핸드오프: 다크 테마 **미확정**. 001 spec에서도 v1 범위 밖. constitution에 "v1: 라이트 전용" 명시 권장 |
| **레이아웃 전략** | constitution에 USER GNB / ADMIN Sidebar 이중 레이아웃 명세 없음 | 명시 추가 필요 (role 기반 레이아웃 분기 규칙) |

### 새로 specify 단계에서 정의해야 할 spec 유닛 후보

| 번호 | 이름 | 이유 |
|---|---|---|
| 004 | **USER 레이아웃 & GNB** | 현재 AppShell은 Sidebar 고정. GNB(상단 탭 + 검색 + 벨 + 아바타 드롭다운)는 완전히 다른 레이아웃 — 가장 높은 의존성 |
| 005 | **인증 & 온보딩 플로우** (W-08~12) | 소셜 동의 `ConsentDialog`, 5단계 온보딩, `RadioCard` 미구현. 현재 LoginPage/RegisterPage는 최소 구현 |
| 006 | **뉴스 홈 (W-U-01) 전체** | 속보 배너, pill 탭, 3-col 카드 그리드, 북마크 토글, AI 요약 1줄, 우측 3종 위젯 전부 신규 |
| 007 | **내 인사이트 (W-U-05)** | 라우트 없음. Donut chart, OutletBars, MissedCard, 북마크 툴팁 모두 신규 |
| 008 | **주간 브리핑 (W-U-06)** | navy magazine banner, RisingKeyword bars, Archive 카드 신규 |
| 009 | **기사 비교 (W-U-02)** | 3-col 비교 레이아웃, 출처 선택 드롭다운, 문장 하이라이트 신규 |
| 010 | **검색/리스트 범용 화면** | keyword·category·bookmark·archive 등 여러 진입점 공유 재사용 뷰 |
| 011 | **ADMIN 추가 화면** (W-A-02, W-A-04, W-A-05) | 뉴스 수집 관리(인제스션), 공지/알림, 콘텐츠 분석 3개 페이지 라우트 누락 |
| 012 | **차트 컴포넌트 시스템** | BiasSpectrum, DivergingBars, KeywordHeatmap, WordCloud, DonutChart — Recharts로 일부 가능하나 커스텀 SVG 필요한 것 다수 |
| 013 | **Toast & Modal 공통 컴포넌트** | Toast(`showToast`/`ToastHost`), Modal(portal 기반) 현재 없음 |

---

## 4. 즉시 수정 가능한 항목 (코드 레벨)

별도 spec 없이 바로 반영 가능한 항목:

1. **`src/index.css` 토큰 수정**
   - `--color-canvas: #f8fafc` (현재 `#faf9f5`)
   - `--radius-card: 8px` (현재 `12px`)
   - `--radius-btn: 6px` (현재 `8px`)
   - `--shadow-card: 0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)` 수정
   - `--shadow-cardhover: 0 2px 4px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.08)` 수정

2. **누락 토큰 추가** (`@theme` 블록)
   - `--color-brand-100`, `--color-brand-600`
   - `--color-cyan: #06b6d4`
   - `--color-ink-700`, `--color-ink-300`
   - `--color-navy-800`, `--color-navy-700`, `--color-navy-600`
   - `--color-danger-tint`, `--color-success-tint`, `--color-warning-tint`, `--color-secondary-tint`
   - `--radius-input: 4px`, `--radius-lg: 12px`, `--radius-2xl: 16px`

3. **토큰 이름 통일** (기존 코드에서 사용 전이라면 rename):
   - `brand-soft` → `brand-50`
   - `brand-deep` → `brand-700`

4. **`fadeup` 애니메이션 수정**
   ```css
   @keyframes fadeup {
     from { opacity: 0; transform: translateY(8px); }
     to   { opacity: 1; transform: translateY(0); }
   }
   .fadeup { animation: fadeup 0.34s cubic-bezier(.2,.7,.3,1) both; }
   ```

5. **폰트 fallback 보강**
   ```css
   --font-sans: "Pretendard Variable", Inter, "Noto Sans KR", system-ui, sans-serif;
   ```

6. **`Card` 컴포넌트 `shadow-card` 클래스 확인** — shadow 값이 바뀌면 자동 반영. `hover:border-brand/40` 패턴은 핸드오프와 일치.

7. **`AppShell.tsx` top bar 추가** (ADMIN 전용):
   - 현재 `h-[64px]` Sidebar header vs 핸드오프 `h-[60px]` — 4px 수정

---

## 5. 추가 명세가 필요한 항목

| 항목 | 이유 |
|---|---|
| **USER GNB 레이아웃 전환 전략** | AppShell 현재 Sidebar 고정. USER = GNB, ADMIN = Sidebar 분기가 라우터 레벨인지 레이아웃 레벨인지 결정 필요. constitution 업데이트도 동반 |
| **GNB 검색 동작** | 타이핑 → 드롭다운 미리보기 → 전체 결과 → ArticleListScreen 전환. 이 플로우가 React Router 기반인지 상태 머신인지 설계 필요 |
| **북마크 전역 상태** | 핸드오프: localStorage `nsf_bm`, 모듈 레벨 pub/sub. 현재: Zustand `uiStore`. 어디에 넣을지 결정 (authStore? 별도 bookmarkStore?) |
| **Toast 시스템** | 핸드오프: `showToast(msg, opts)` singleton. 현재 없음. Zustand store인지 context인지 결정 |
| **Modal/Dialog 시스템** | `createPortal` 기반 전역 모달 (프로필, 알림 설정, 공지 편집 공유). Radix Dialog 채택 여부 결정 |
| **AI 요약 카드 "Gemini" 뱃지** | API 응답에 AI 제공자 정보가 포함되는지 Backend에 스펙 확인 필요 |
| **소셜 로그인 (Kakao/Google/Apple)** | Firebase Auth 설정(.env.example에 있음)이 소셜까지 커버하는지, Apple은 별도인지 확인 |
| **온보딩 데스크탑/모바일 레이아웃** | 핸드오프에 두 가지 레이아웃 토글 있음 — 웹 전용이므로 모바일 레이아웃 범위 여부 결정 |
| **편향 스펙트럼 그라데이션 컴포넌트** | `BiasSpectrum` SVG 마커 + 그라데이션 바 — Recharts 커버 불가. 커스텀 SVG 또는 외부 라이브러리 결정 |
| **워드클라우드** | ResizeObserver 기반 SVG orb. CLAUDE.md에 "별도 라이브러리 또는 커스텀 SVG"로만 명시됨 — 라이브러리 선택 결정 필요 (react-wordcloud, d3-cloud 등) |

---

## 6. 우선순위 분류

| 항목 | 분류 | 이유 |
|---|---|---|
| `index.css` 토큰 값 수정 (canvas, radius, shadow) | **즉시** | 기존 컴포넌트에 즉시 영향, 스펙 불일치 가장 명확 |
| 누락 색상 토큰 추가 (cyan, ink-700, brand-100 등) | **즉시** | 이후 모든 컴포넌트에서 사용될 기반 |
| `fadeup` 애니메이션 수정 | **즉시** | 1줄 CSS 변경 |
| USER GNB 레이아웃 분기 (spec 004) | **다음 스프린트** | 현재 Sidebar 구조를 전제로 만들어진 페이지들에 영향 크나, 먼저 설계 후 진행 필요 |
| Toast + Modal 공통 컴포넌트 (spec 013) | **다음 스프린트** | 북마크 토글, 프로필 편집, 알림 설정 등 여러 화면이 의존 |
| W-U-01 뉴스 홈 전면 재구현 (spec 006) | **다음 스프린트** | USER GNB spec(004) 완료 후 착수 |
| 차트 컴포넌트 시스템 (spec 012) | **다음 스프린트** | 트렌드·편향·인사이트 화면 블로커 |
| W-U-05 내 인사이트 (spec 007) | **다음 스프린트** | 차트 시스템(012) 완료 후 착수 |
| W-U-06 주간 브리핑 (spec 008) | **다음 스프린트** | 독립적으로 착수 가능 |
| W-U-02 기사 비교 (spec 009) | **다음 스프린트** | W-04 기사 상세 완성 후 착수 |
| 온보딩 플로우 (spec 005) | **다음 스프린트** | 인증 플로우 완성 후 |
| W-A-02 뉴스 수집 관리 (spec 011) | **다음 스프린트** | ADMIN 우선순위 1 |
| W-A-04 공지/알림 (spec 011) | **백로그** | ADMIN 기능 중 후순위 |
| W-A-05 콘텐츠 분석 (spec 011) | **백로그** | ADMIN 기능 중 후순위 |
| 소셜 동의 + 온보딩 모바일 레이아웃 | **백로그** | 웹 전용 범위에서 낮은 우선순위 |
| 다크 테마 토큰셋 | **백로그** | 핸드오프 미확정, v1 범위 밖 |
| editorial 테마 | **백로그** | 핸드오프 미확정 대체 테마 |

---

## 요약

**당장 코드 수정**: `index.css @theme` 토큰 값 6개 수정 + 누락 토큰 13개 추가. 별도 spec 불필요.

**다음 spec 우선순위**: `004 USER GNB 레이아웃` → `013 Toast/Modal` → `006 뉴스 홈` → `012 차트 시스템`.

**아키텍처 결정 선행 필요**: USER GNB vs ADMIN Sidebar 레이아웃 분기 전략 + constitution 반응형 조항 수정 (핸드오프는 모바일 범위 밖이나 constitution은 mobile 타깃 포함).

**미확정 항목** (임의 구현 금지): 다크 테마 토큰셋, editorial 테마, 버튼 pressed/loading 상태, 이미지 파이프라인.
