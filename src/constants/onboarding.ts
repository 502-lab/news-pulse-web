export type Category =
  | 'ECONOMY_FINANCE'
  | 'IT'
  | 'POLITICS'
  | 'SPORTS'
  | 'WORLD'
  | 'ENTERTAINMENT_CULTURE'
  | 'HEALTH_MEDICINE'
  | 'AUTOMOTIVE';

export type SummaryDepth = 'BRIEF' | 'BALANCED' | 'DEEP';
export type ConsumeMode = 'READ' | 'LISTEN' | 'BOTH';
export type VoiceId = 'harin' | 'junseo';
export type KeywordType = 'COMPANY' | 'THEME' | 'PERSON';

export const ONB_AGES = [
  { label: '20대', value: 'TWENTIES' },
  { label: '30대', value: 'THIRTIES' },
  { label: '40대', value: 'FORTIES' },
  { label: '50대 이상', value: 'FIFTIES_PLUS' },
] as const;

export const AGE_TO_ENUM: Record<string, string> = Object.fromEntries(
  ONB_AGES.map(({ label, value }) => [label, value]),
);

export const ONB_JOBS = [
  'IT·개발',
  '금융·경제',
  '미디어·마케팅',
  '학생',
  '전문직',
  '공공·행정',
  '기타',
] as const;

export const ONB_TOPICS: Array<{
  cat: Category;
  label: string;
  icon: string;
  color: string;
}> = [
  { cat: 'ECONOMY_FINANCE', label: '경제·금융', icon: 'trend', color: '#06B6D4' },
  { cat: 'IT', label: 'IT·과학', icon: 'cpu', color: '#6366F1' },
  { cat: 'POLITICS', label: '정치', icon: 'bank', color: '#F59E0B' },
  { cat: 'SPORTS', label: '스포츠', icon: 'trophy', color: '#10B981' },
  { cat: 'WORLD', label: '세계', icon: 'globe', color: '#0EA5E9' },
  { cat: 'ENTERTAINMENT_CULTURE', label: '연예·문화', icon: 'film', color: '#EC4899' },
  { cat: 'HEALTH_MEDICINE', label: '건강·의학', icon: 'heart', color: '#EF4444' },
  { cat: 'AUTOMOTIVE', label: '자동차', icon: 'car', color: '#64748B' },
];

export const ONB_KW_GROUPS: Array<{
  group: string;
  type: KeywordType;
  items: string[];
}> = [
  {
    group: '기업·브랜드',
    type: 'COMPANY',
    items: ['삼성전자', '네이버', '카카오', '현대차', '테슬라', '엔비디아'],
  },
  {
    group: '테마·이슈',
    type: 'THEME',
    items: ['AI·반도체', '기준금리', '부동산', '전기차', '우주·항공', 'K-콘텐츠'],
  },
  {
    group: '인물',
    type: 'PERSON',
    items: ['주요 정치인', '스포츠 스타', 'CEO·창업가'],
  },
];

export const ONB_DEPTHS: Array<{
  label: string;
  sub: string;
  value: SummaryDepth;
}> = [
  { label: '핵심만 빠르게', sub: '1~2문장으로 요점만', value: 'BRIEF' },
  { label: '균형 있게', sub: '핵심 + 배경 맥락까지', value: 'BALANCED' },
  { label: '깊이 있게', sub: '심층 분석과 관련 기사까지', value: 'DEEP' },
];

export const ONB_MODES: Array<{
  label: string;
  icon: string;
  value: ConsumeMode;
}> = [
  { label: '읽기', icon: 'article', value: 'READ' },
  { label: '듣기', icon: 'headphones', value: 'LISTEN' },
  { label: '둘 다', icon: 'spark2', value: 'BOTH' },
];

export const ONB_TIMES: Array<{ label: string; value: string }> = [
  { label: '출근길', value: '07:30' },
  { label: '점심', value: '12:30' },
  { label: '잠들기 전', value: '21:00' },
];

export const ONB_VOICES: Array<{
  id: VoiceId;
  av: string;
  name: string;
  desc: string;
  color: string;
}> = [
  {
    id: 'harin',
    av: '하',
    name: '하린 · 차분한 여성',
    desc: '또렷하고 안정적인 아나운서 톤',
    color: '#EC4899',
  },
  {
    id: 'junseo',
    av: '준',
    name: '준서 · 신뢰감 남성',
    desc: '낮고 또렷한 뉴스 진행자 톤',
    color: '#6366F1',
  },
];

export const ONB_STEPS: Array<{ label: string; desc: string }> = [
  { label: '프로필', desc: '닉네임 · 연령대' },
  { label: '관심사', desc: '관심 토픽 선택' },
  { label: '키워드', desc: '기업 · 이슈 팔로우' },
  { label: '읽는 방식', desc: '요약 · 소비 형식' },
  { label: '브리핑', desc: '시간 · AI 음성' },
];

export const ONB_HEADS: Record<number, [string, string]> = {
  1: [
    '먼저, 어떻게 불러드리면 될까요?',
    '닉네임과 연령대를 알려주시면 더 잘 맞는 뉴스를 골라드려요.',
  ],
  2: [
    '어떤 뉴스에 관심이 있으세요?',
    '최소 3개 이상 선택하면 AI가 맞춤 피드를 만들어드려요.',
  ],
  3: [
    '더 챙겨볼 키워드가 있나요?',
    '관심 기업·인물·이슈를 팔로우하면 관련 소식만 모아드려요.',
  ],
  4: [
    '뉴스, 어떻게 보는 걸 좋아하세요?',
    '요약 깊이와 소비 방식에 맞춰 분량과 형식을 조정해드려요.',
  ],
  5: [
    '언제, 어떤 목소리로 들려드릴까요?',
    '매일 이 시간에 AI 음성 브리핑을 보내드려요. 나중에 바꿀 수 있어요.',
  ],
};
