import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { getCategoryMeta } from '@/constants/category';
import type { CategoryData } from '@/types/dashboard';

interface CategoryChartProps {
  data: CategoryData[];
  isError: boolean;
  refetch: () => void;
}

export default function CategoryChart({ data, isError, refetch }: CategoryChartProps) {
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-ink-400">
        <p className="text-sm">데이터를 불러올 수 없습니다.</p>
        <button
          onClick={refetch}
          aria-label="카테고리 데이터 재시도"
          className="text-brand text-sm hover:underline cursor-pointer"
        >
          재시도
        </button>
      </div>
    );
  }

  const isEmpty = data.every((d) => d.count === 0);

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-[240px] text-ink-400 text-sm">
        아직 집계된 데이터가 없습니다.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240} aria-label="카테고리별 뉴스 분포">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="category"
          tickFormatter={(v: string) => getCategoryMeta(v).label}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [value, getCategoryMeta(name).label]}
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getCategoryMeta(entry.category).chartColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
