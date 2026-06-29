# Component Contracts: 007 온보딩 (W-12)

---

## useOnboarding (컨트롤러 훅)

```typescript
// src/hooks/useOnboarding.ts

interface UseOnboardingReturn {
  state: OnboardingFormState;
  dispatch: Dispatch<OnboardingAction>;
  canProceed: boolean;
  next: () => void;           // step < 5 → NEXT, step === 5 → submit()
  back: () => void;           // step > 1 → BACK
  skip: () => void;           // step 3 or 4 → SKIP (step+1)
  submit: () => Promise<void>;
}

function useOnboarding(): UseOnboardingReturn
```

**제약:**
- `submit`은 `canProceed` 관계없이 외부에서 직접 호출 가능하나, `OnboardingPage`는 항상 `next()`를 통해 제출 (step 5에서 NEXT → submit 내부 호출)
- `skip`은 step 3, 4에서만 의미 있음. 다른 단계에서 호출 시 no-op.

---

## OnbRail

```typescript
// src/components/features/onboarding/OnbRail.tsx

interface OnbRailProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}
```

**렌더 규칙:**
- step < current → 완료(brand 체크 아이콘, `bg-brand text-white`)
- step === current → 현재(`bg-white text-navy`)
- step > current → 대기(`bg-white/10 text-ink-400`)
- 브랜드마크 + "맞춤 설정 · 1분이면 끝나요" 부제 포함
- 하단 footer: "모든 설정은 가입 후 언제든 바꿀 수 있어요."

---

## OnbStep1Profile

```typescript
interface OnbStep1ProfileProps {
  nick: string;
  age: string;
  job: string;
  onNick: (v: string) => void;
  onAge: (v: string) => void;
  onJob: (v: string) => void;
}
```

**렌더 규칙:**
- 닉네임: `input[maxLength=12]`, `id="onb-nick"`, 연결 `<label htmlFor="onb-nick">닉네임</label>` (필수 표시)
- 글자수 카운터: `{nick.length} / 12`
- 연령대: 4종 토글 버튼 (`aria-pressed`), 재선택 시 빈 값으로 deselect 허용
- 직업: 7종 태그 토글 버튼 (`aria-pressed`), 재선택 시 deselect 허용

---

## OnbStep2Topics

```typescript
interface OnbStep2TopicsProps {
  topics: Category[];
  onToggle: (cat: Category) => void;
}
```

**렌더 규칙:**
- `grid grid-cols-2 sm:grid-cols-4 gap-3`
- 각 카드: `relative h-28 rounded-card border`, 선택 시 `bg-brand border-brand shadow-cardhover`
- 아이콘 배경: 선택 = `bg-white/20 text-white`, 미선택 = `{color}1A` 배경 + `{color}` 텍스트 (인라인 style 허용, R-04)
- 선택 시 우상단 체크 배지 (`absolute top-3 right-3`)
- `aria-pressed={topics.includes(t.cat)}`

---

## OnbStep3Keywords

```typescript
interface OnbStep3KeywordsProps {
  keywords: string[];
  onToggle: (kw: string) => void;
}
```

**렌더 규칙:**
- 3개 그룹, 각 그룹 헤더 + 태그 목록
- 태그: 선택 `bg-brand text-white`, 미선택 `bg-white border-ink-200`
- 선택된 태그에 `<Icon name="check" size={14} />` prefix
- `aria-pressed`

---

## OnbStep4Reading

```typescript
interface OnbStep4ReadingProps {
  depth: SummaryDepth;
  consumeMode: ConsumeMode;
  onDepth: (v: SummaryDepth) => void;
  onMode: (v: ConsumeMode) => void;
}
```

**렌더 규칙:**
- 깊이: 3종 라디오 스타일 카드 (`flex items-center gap-3 px-4 py-3.5 rounded-card border`)
- 소비 모드: 3종 아이콘+텍스트 카드 (`grid-cols-3 gap-3`)

---

## OnbStep5Briefing

```typescript
interface OnbStep5BriefingProps {
  briefingTime: string;
  voice: VoiceId | null;
  pushAgreed: boolean;
  onTime: (v: string) => void;
  onVoice: (v: VoiceId | null) => void;
  onPush: (v: boolean) => void;
}
```

**렌더 규칙:**
- 시간 3종: `grid-cols-3`, 선택 `bg-brand-50 border-brand`
- 음성 2종: 각 행 = 아바타 원 + 이름/설명 + 재생 버튼(`disabled`) + 라디오
  - 재생 `<button disabled aria-label="앱에서 미리듣기 가능">` 비활성
  - 하단 보조 문구: "🎧 앱에서 목소리를 미리 들어보세요"
- 앱 설치 버튼: `<button disabled>앱 다운로드</button>` placeholder
- 푸시 알림: bell 아이콘 + 설명 + 토글 스위치
- `aria-checked` on toggle switch (`role="switch"`)

---

## OnboardingPage (셸)

```typescript
// src/pages/onboarding/OnboardingPage.tsx
// Props: none (라우트 컴포넌트)
```

**렌더 구조:**
```
<div min-h-screen bg-canvas flex items-center justify-center p-6>
  <div max-w-[940px] bg-white border rounded-2xl shadow-pop overflow-hidden flex
       style={{ height: 'min(680px, 92vh)' }}>
    <OnbRail currentStep={state.step} />
    <div flex-1 flex flex-col>
      {/* 우측 콘텐츠 영역 */}
      <div flex-1 overflow-y-auto px-9 py-8>
        {/* STEP n / 5 + 건너뛰기 */}
        {/* 제목 + 설명 */}
        {/* 에러 표시 (submitError) */}
        {/* 단계별 OnbStep 컴포넌트 */}
      </div>
      {/* 푸터 */}
      <footer border-t border-ink-100 px-9 py-4 flex justify-between>
        <button "이전" disabled={step===1} />
        <div flex gap-4>
          {step===2 && <span>{topics.length}개 선택됨</span>}
          {step===3 && <span>{keywords.length}개 팔로우 중</span>}
          <button "다음"/"Newsift 시작하기" disabled={!canProceed || isSubmitting} />
        </div>
      </footer>
    </div>
  </div>
</div>
```

**재진입 가드** (`onboardingCompleted: true` 사용자 → `/home`):
```typescript
// 컴포넌트 상단 (useEffect 없이, 렌더 시점에 처리)
const user = useAuthStore(s => s.user);
if (user?.onboardingCompleted) return <Navigate to="/home" replace />;
```
이 방식이 플래시 없는 SC-004 충족에 가장 단순하고 효과적.
