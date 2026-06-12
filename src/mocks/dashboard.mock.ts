import type { DashboardStat, CategoryData, NewsItem } from '@/types/dashboard';

const delay = (ms: number): Promise<void> =>
  import.meta.env.VITE_MOCK_DELAY === 'true'
    ? new Promise<void>((r) => setTimeout(r, ms))
    : Promise.resolve();

export async function fetchDashboardStats(): Promise<DashboardStat[]> {
  await delay(500);
  return [
    { id: 'today-news', label: '오늘의 뉴스 수',        icon: 'Newspaper', value: 247, delta: 23,   deltaPercent: 10.3  },
    { id: 'analyzed',   label: '분석된 기사 수',         icon: 'FileText',  value: 198, delta: 18,   deltaPercent: 10.0  },
    { id: 'bias',       label: '평균 편향 점수',          icon: 'Scale',     value: 3.2, delta: -0.3, deltaPercent: -8.6  },
    { id: 'keywords',   label: '모니터링 중인 키워드 수', icon: 'Tag',       value: 42,  delta: 0,    deltaPercent: 0     },
  ];
}

export async function fetchCategoryChart(): Promise<CategoryData[]> {
  await delay(500);
  return [
    { category: 'politics',   count: 68 },
    { category: 'economy',    count: 54 },
    { category: 'society',    count: 71 },
    { category: 'technology', count: 32 },
    { category: 'culture',    count: 15 },
    { category: 'sports',     count: 7  },
  ];
}

export async function fetchNewsFeed(): Promise<NewsItem[]> {
  await delay(500);
  return Array.from({ length: 10 }, (_, i) => ({
    id: `news-${i + 1}`,
    title: `뉴스 기사 제목 ${i + 1} — 예시 헤드라인입니다`,
    source: ['연합뉴스', 'KBS', 'MBC', '조선일보', '한겨레'][i % 5],
    category: ['politics', 'economy', 'society', 'technology', 'culture', 'sports'][i % 6],
    publishedAt: new Date(Date.now() - i * 3_600_000).toISOString(),
    thumbnailUrl: i % 3 === 0 ? null : `https://picsum.photos/seed/${i + 1}/160/90`,
  }));
}
