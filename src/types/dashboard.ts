export interface DashboardStat {
  id: string;
  label: string;
  icon: string;
  value: number;
  delta: number;
  deltaPercent: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl: string | null;
}

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
