export interface NewsItem {
  id: string;
  title: string;
  source: string;
  cat: string;
  bias: number;
  time: string;
  reads: number;
  summary?: string;
  content?: string;
}

export interface StatCardData {
  label: string;
  sub: string;
  value: number;
  delta: number;
  fmt: 'int' | 'pct';
  icon: string;
  tone: 'brand' | 'cyan' | 'ok' | 'warn';
}
