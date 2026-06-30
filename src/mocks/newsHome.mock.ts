import type { NewsItem } from "@/types/news";

export interface TrendingKeyword {
  rank: number;
  keyword: string;
  count: number;
  delta: number;
}

export interface AIBriefing {
  sentences: string[];
  generatedAt: string;
}

export const NEWS_HOME: NewsItem[] = [
  {
    id: "n001",
    title: '한국은행, 기준금리 0.25%p 인하… "경기 둔화 선제 대응"',
    source: "연합뉴스",
    cat: "경제",
    bias: 0.1,
    time: "3분 전",
    reads: 4821,
    summary:
      "한국은행 금융통화위원회가 기준금리를 연 3.25%로 인하했다. 내수 침체와 수출 둔화에 선제 대응하기 위한 결정이라고 밝혔다.",
    isBreaking: true,
  },
  {
    id: "n002",
    title: "삼성전자, 차세대 3나노 GAA 공정 양산 돌입",
    source: "조선비즈",
    cat: "기술",
    bias: 0.2,
    time: "18분 전",
    reads: 3102,
    summary:
      "삼성전자가 3세대 GAA 아키텍처 기반 3나노 공정 양산을 공식 시작했다. 전력 효율 30% 향상, 성능 15% 개선이 목표다.",
  },
  {
    id: "n003",
    title: "여야, 추경안 규모 두고 다시 평행선… 국회 논의 난항",
    source: "KBS",
    cat: "정치",
    bias: -0.1,
    time: "35분 전",
    reads: 2754,
    summary:
      "여야가 추가경정예산안 규모를 둘러싸고 합의점을 찾지 못하고 있다. 여당은 10조 원, 야당은 18조 원을 주장하며 맞서고 있다.",
  },
  {
    id: "n004",
    title: "AI 반도체 스타트업 퓨리오사AI, 시리즈C 3000억 유치 성공",
    source: "매일경제",
    cat: "기술",
    bias: 0.3,
    time: "52분 전",
    reads: 1987,
    summary:
      "국내 AI 반도체 스타트업 퓨리오사AI가 시리즈C 라운드에서 약 3000억 원 규모의 투자 유치에 성공했다. 글로벌 반도체 시장 공략을 가속화한다.",
  },
  {
    id: "n005",
    title: "국내 대형마트 3사, 새벽 배송 시장 진출 본격화",
    source: "한국경제",
    cat: "경제",
    bias: 0.0,
    time: "1시간 전",
    reads: 1543,
    summary:
      "이마트·롯데마트·홈플러스가 연내 새벽 배송 서비스를 출시한다. 쿠팡·컬리가 주도하던 시장에 오프라인 유통 공룡들이 뛰어드는 양상이다.",
  },
  {
    id: "n006",
    title: "정부, 2030년까지 AI 인재 30만 명 양성 로드맵 발표",
    source: "연합뉴스",
    cat: "정치",
    bias: 0.1,
    time: "1시간 전",
    reads: 1201,
    summary:
      "과기정통부가 2030년까지 AI 분야 전문 인재 30만 명을 양성하겠다는 국가 AI 인재 육성 로드맵을 발표했다.",
  },
  {
    id: "n007",
    title: "오픈AI, GPT-5 발표… 추론 능력 대폭 강화",
    source: "TechCrunch",
    cat: "기술",
    bias: 0.2,
    time: "2시간 전",
    reads: 5632,
    summary:
      "오픈AI가 GPT-5를 공개했다. 다중 모달 추론 능력과 코드 생성 정확도가 이전 세대 대비 크게 향상됐다는 것이 핵심이다.",
  },
  {
    id: "n008",
    title: "서울시, 한강변 초고층 복합개발 계획 확정",
    source: "서울신문",
    cat: "경제",
    bias: -0.2,
    time: "2시간 전",
    reads: 987,
    summary:
      "서울시가 한강변 일대에 최고 70층 규모의 복합개발 사업을 확정 발표했다. 주거·업무·상업시설이 복합 구성된다.",
  },
  {
    id: "n009",
    title: "칸 영화제, 한국 감독 박찬욱 심사위원장 위촉",
    source: "씨네21",
    cat: "문화",
    bias: 0.0,
    time: "3시간 전",
    reads: 3211,
    summary:
      "제78회 칸 국제영화제가 박찬욱 감독을 경쟁 부문 심사위원장으로 공식 위촉했다. 아시아 감독의 칸 심사위원장 선임은 이례적이다.",
  },
  {
    id: "n010",
    title: "글로벌 사이버보안 기업 크라우드스트라이크, 韓 지사 설립",
    source: "ZDNet Korea",
    cat: "기술",
    bias: 0.1,
    time: "3시간 전",
    reads: 756,
    summary:
      "크라우드스트라이크가 서울에 공식 한국 지사를 설립했다. 국내 기업의 사이버보안 수요 증가에 대응한 현지화 전략의 일환이다.",
  },
  {
    id: "n011",
    title: "국민의힘·민주당, 선거구 획정 협상 또 결렬",
    source: "JTBC",
    cat: "정치",
    bias: -0.3,
    time: "4시간 전",
    reads: 2108,
    summary:
      "여야가 다음 총선 선거구 획정안을 두고 6차 협상에서도 최종 합의에 실패했다. 인구 변화 반영 기준을 놓고 이견이 좁혀지지 않고 있다.",
  },
  {
    id: "n012",
    title: "넷플릭스 한국 오리지널 시리즈, 글로벌 동시 1위",
    source: "스포츠경향",
    cat: "문화",
    bias: 0.1,
    time: "5시간 전",
    reads: 4103,
    summary:
      "넷플릭스 한국 오리지널 드라마가 공개 첫 주 만에 비영어권 TV 시리즈 부문 글로벌 동시 1위를 달성했다.",
  },
  {
    id: "n013",
    title: "현대차그룹, 美 조지아 전기차 공장 가동 시작",
    source: "한국경제",
    cat: "경제",
    bias: 0.2,
    time: "5시간 전",
    reads: 1876,
    summary:
      "현대차그룹이 미국 조지아주에 건설한 전기차 전용 공장 메타플랜트 아메리카(HMGMA) 양산을 시작했다.",
  },
];

export const TRENDING_KEYWORDS: TrendingKeyword[] = [
  { rank: 1, keyword: "AI 반도체", count: 1284, delta: 312 },
  { rank: 2, keyword: "기준금리 인하", count: 987, delta: 201 },
  { rank: 3, keyword: "GPT-5", count: 854, delta: 854 },
  { rank: 4, keyword: "칸 영화제", count: 623, delta: -47 },
  { rank: 5, keyword: "추경안", count: 441, delta: 0 },
];

export const AI_BRIEFING: AIBriefing = {
  sentences: [
    "한국은행이 기준금리를 인하하며 경기 부양 의지를 내비쳤고, 금융 시장은 긍정적으로 반응했습니다.",
    "AI 반도체 분야에서 국내 스타트업의 대규모 투자 유치가 이어지며 생태계가 빠르게 성장하고 있습니다.",
    "정치권에서는 추경안 규모를 둘러싼 여야 갈등이 계속되어 처리 시점이 불투명한 상황입니다.",
    "한국 문화 콘텐츠는 칸 영화제 심사위원장 선임과 넷플릭스 글로벌 1위로 위상이 한층 높아졌습니다.",
  ],
  generatedAt: "오늘 09:00 기준",
};
