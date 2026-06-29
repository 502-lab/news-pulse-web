# Data Model: 007 온보딩 (W-12)

---

## 1. 온보딩 상태 (useReducer State)

```typescript
// src/hooks/useOnboarding.ts

type Category =
  | 'ECONOMY_FINANCE' | 'IT' | 'POLITICS' | 'SPORTS'
  | 'WORLD' | 'ENTERTAINMENT_CULTURE' | 'HEALTH_MEDICINE' | 'AUTOMOTIVE';

type SummaryDepth = 'BRIEF' | 'BALANCED' | 'DEEP';
type ConsumeMode = 'READ' | 'LISTEN' | 'BOTH';
type VoiceId = 'harin' | 'junseo';
type KeywordType = 'COMPANY' | 'THEME' | 'PERSON';
type SubmitStatus = 'idle' | 'loading' | 'error';

interface OnboardingFormState {
  step: 1 | 2 | 3 | 4 | 5;
  nick: string;
  age: string;           // '' | '20대' | '30대' | '40대' | '50대 이상'
  job: string;           // '' | one of ONB_JOBS labels
  topics: Category[];    // min 3 required for step 2
  keywords: string[];
  depth: SummaryDepth;
  consumeMode: ConsumeMode;
  briefingTime: string;  // 'HH:mm'
  voice: VoiceId | null; // null = voiceEnabled: false
  pushAgreed: boolean;
  submitStatus: SubmitStatus;
  submitError: string;
}
```

**초기값:**
```typescript
const INITIAL_STATE: OnboardingFormState = {
  step: 1,
  nick: '',
  age: '',
  job: '',
  topics: [],
  keywords: [],
  depth: 'BALANCED',
  consumeMode: 'READ',
  briefingTime: '07:30',
  voice: null,
  pushAgreed: true,
  submitStatus: 'idle',
  submitError: '',
};
```

---

## 2. Reducer Actions

```typescript
type OnboardingAction =
  | { type: 'SET_NICK'; value: string }
  | { type: 'SET_AGE'; value: string }
  | { type: 'SET_JOB'; value: string }
  | { type: 'TOGGLE_TOPIC'; value: Category }
  | { type: 'TOGGLE_KW'; value: string }
  | { type: 'SET_DEPTH'; value: SummaryDepth }
  | { type: 'SET_CONSUME_MODE'; value: ConsumeMode }
  | { type: 'SET_TIME'; value: string }
  | { type: 'SET_VOICE'; value: VoiceId | null }
  | { type: 'SET_PUSH'; value: boolean }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'SUBMIT_RESET' };
```

---

## 3. 파생 로직

### canProceed (단계별 "다음" 활성 조건)
```typescript
function getCanProceed(state: OnboardingFormState): boolean {
  if (state.step === 1) return state.nick.trim().length > 0;
  if (state.step === 2) return state.topics.length >= 3;
  return true;
}
```

### API 페이로드 빌드
```typescript
// voiceId 미포함, voice !== null → voiceEnabled: true
function buildPayload(state: OnboardingFormState): OnboardingRequest {
  return {
    nickname: state.nick.trim() || undefined,
    ageGroup: AGE_TO_ENUM[state.age] ?? undefined,
    occupation: state.job || undefined,
    categories: state.topics,
    keywords: state.keywords.length > 0
      ? state.keywords.map(kw => {
          const group = ONB_KW_GROUPS.find(g => g.items.includes(kw));
          return { keyword: kw, type: group?.type ?? 'THEME' };
        })
      : undefined,
    summaryDepth: state.depth,
    consumeMode: state.consumeMode,
    briefingTime: state.briefingTime,
    timezoneOffset: new Date().getTimezoneOffset() * -1,
    voiceEnabled: state.voice !== null,
    pushAgreed: state.pushAgreed,
  };
}
```

---

## 4. 상수 모듈 (`src/constants/onboarding.ts`)

```typescript
// 연령대 4종 (TEENS 제외)
export const ONB_AGES = [
  { label: '20대', value: 'TWENTIES' },
  { label: '30대', value: 'THIRTIES' },
  { label: '40대', value: 'FORTIES' },
  { label: '50대 이상', value: 'FIFTIES_PLUS' },
] as const;

export const AGE_TO_ENUM: Record<string, string> = Object.fromEntries(
  ONB_AGES.map(({ label, value }) => [label, value])
);

// 직업 7종 (디자인 기준)
export const ONB_JOBS = [
  'IT·개발', '금융·경제', '미디어·마케팅', '학생', '전문직', '공공·행정', '기타',
] as const;

// 토픽 8종 — API enum + 디자인 Icon + 컬러
export const ONB_TOPICS: Array<{ cat: Category; label: string; icon: string; color: string }> = [
  { cat: 'ECONOMY_FINANCE', label: '경제·금융', icon: 'trend',   color: '#06B6D4' },
  { cat: 'IT',              label: 'IT·과학',   icon: 'cpu',     color: '#6366F1' },
  { cat: 'POLITICS',        label: '정치',      icon: 'bank',    color: '#F59E0B' },
  { cat: 'SPORTS',          label: '스포츠',    icon: 'trophy',  color: '#10B981' },
  { cat: 'WORLD',           label: '세계',      icon: 'globe',   color: '#0EA5E9' },
  { cat: 'ENTERTAINMENT_CULTURE', label: '연예·문화', icon: 'film', color: '#EC4899' },
  { cat: 'HEALTH_MEDICINE', label: '건강·의학', icon: 'heart',   color: '#EF4444' },
  { cat: 'AUTOMOTIVE',      label: '자동차',    icon: 'car',     color: '#64748B' },
];

// 키워드 그룹 3종 (디자인 기준)
export const ONB_KW_GROUPS: Array<{
  group: string;
  type: KeywordType;
  items: string[];
}> = [
  { group: '기업·브랜드', type: 'COMPANY',
    items: ['삼성전자', '네이버', '카카오', '현대차', '테슬라', '엔비디아'] },
  { group: '테마·이슈', type: 'THEME',
    items: ['AI·반도체', '기준금리', '부동산', '전기차', '우주·항공', 'K-콘텐츠'] },
  { group: '인물', type: 'PERSON',
    items: ['주요 정치인', '스포츠 스타', 'CEO·창업가'] },
];

// 요약 깊이 3종
export const ONB_DEPTHS = [
  { label: '핵심만 빠르게', sub: '1~2문장으로 요점만',      value: 'BRIEF'    },
  { label: '균형 있게',     sub: '핵심 + 배경 맥락까지',    value: 'BALANCED' },
  { label: '깊이 있게',     sub: '심층 분석과 관련 기사까지', value: 'DEEP'    },
] as const;

// 소비 모드 3종
export const ONB_MODES = [
  { label: '읽기', icon: 'article',    value: 'READ'   },
  { label: '듣기', icon: 'headphones', value: 'LISTEN' },
  { label: '둘 다', icon: 'spark2',   value: 'BOTH'   },
] as const;
// ※ 'article'/'headphones'/'spark2' 아이콘이 Icon.tsx에 없으면 대체 아이콘 또는 SVG 인라인 처리
// (구현 시 확인 필요 — 디자인 icon명이 Icon.tsx 키와 다를 수 있음)

// 브리핑 시간 3종
export const ONB_TIMES = [
  { label: '출근길', value: '07:30' },
  { label: '점심',   value: '12:30' },
  { label: '잠들기 전', value: '21:00' },
] as const;

// AI 음성 2종
export const ONB_VOICES = [
  { id: 'harin',  av: '하', name: '하린 · 차분한 여성', desc: '또렷하고 안정적인 아나운서 톤', color: '#EC4899' },
  { id: 'junseo', av: '준', name: '준서 · 신뢰감 남성', desc: '낮고 또렷한 뉴스 진행자 톤',   color: '#6366F1' },
] as const;

// 단계 메타
export const ONB_STEPS = [
  { label: '프로필',   desc: '닉네임 · 연령대' },
  { label: '관심사',   desc: '관심 토픽 선택' },
  { label: '키워드',   desc: '기업 · 이슈 팔로우' },
  { label: '읽는 방식', desc: '요약 · 소비 형식' },
  { label: '브리핑',   desc: '시간 · AI 음성' },
] as const;

// 단계 헤드 문구
export const ONB_HEADS: Record<number, [string, string]> = {
  1: ['먼저, 어떻게 불러드리면 될까요?', '닉네임과 연령대를 알려주시면 더 잘 맞는 뉴스를 골라드려요.'],
  2: ['어떤 뉴스에 관심이 있으세요?', '최소 3개 이상 선택하면 AI가 맞춤 피드를 만들어드려요.'],
  3: ['더 챙겨볼 키워드가 있나요?', '관심 기업·인물·이슈를 팔로우하면 관련 소식만 모아드려요.'],
  4: ['뉴스, 어떻게 보는 걸 좋아하세요?', '요약 깊이와 소비 방식에 맞춰 분량과 형식을 조정해드려요.'],
  5: ['언제, 어떤 목소리로 들려드릴까요?', '매일 이 시간에 AI 음성 브리핑을 보내드려요. 나중에 바꿀 수 있어요.'],
};
```

---

## 5. 타입 수정 사항

### `src/lib/api/auth.ts` — `submitOnboarding` 반환 타입 수정
```typescript
// 변경 전 (버그)
export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingStatusResponse>

// 변경 후 (API spec: ApiResponseVoid)
export async function submitOnboarding(body: OnboardingRequest): Promise<void>
```

---

## 6. 파일 → 역할 매핑

| 파일 | 역할 |
|---|---|
| `src/hooks/useOnboarding.ts` | useReducer 컨트롤러 훅 |
| `src/constants/onboarding.ts` | 모든 ONB_* 상수, enum 매핑 |
| `src/pages/onboarding/OnboardingPage.tsx` | 셸 — 훅 + 컴포넌트 조합 |
| `src/components/features/onboarding/OnbRail.tsx` | 좌측 단계 레일 |
| `src/components/features/onboarding/OnbStep1Profile.tsx` | 1단계 본문 |
| `src/components/features/onboarding/OnbStep2Topics.tsx` | 2단계 본문 |
| `src/components/features/onboarding/OnbStep3Keywords.tsx` | 3단계 본문 |
| `src/components/features/onboarding/OnbStep4Reading.tsx` | 4단계 본문 |
| `src/components/features/onboarding/OnbStep5Briefing.tsx` | 5단계 본문 |
