import Icon from './Icon';
import type { StatCardData } from '@/types/news';

interface StatCardProps {
  data: StatCardData;
  loading?: boolean;
}

const TONE_MAP: Record<StatCardData['tone'], { color: string; bg: string }> = {
  brand: { color: '#6366F1', bg: '#EEF0FF' },
  cyan: { color: '#06B6D4', bg: '#ECFEFF' },
  ok: { color: '#10B981', bg: '#ECFDF5' },
  warn: { color: '#F59E0B', bg: '#FFF7ED' },
};

export default function StatCard({ data, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-ink-200 rounded-card shadow-card p-5">
        <div className="skel h-9 w-9 rounded-lg mb-4" />
        <div className="skel h-3 w-20 rounded mb-3" />
        <div className="skel h-7 w-24 rounded" />
      </div>
    );
  }

  const { label, sub, value, delta, fmt, icon, tone } = data;
  const { color, bg } = TONE_MAP[tone];
  const up = delta >= 0;
  const formattedValue =
    fmt === 'pct' ? value.toFixed(2) + '%' : value.toLocaleString('ko-KR');

  return (
    <div className="bg-white border border-ink-200 rounded-card shadow-card p-5 transition-all hover:border-brand/40 hover:shadow-cardhover group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: bg, color }}
          aria-hidden="true"
        >
          <Icon name={icon} size={18} />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 text-[12px] font-semibold tnum ${up ? 'text-ok' : 'text-danger'}`}
        >
          {up ? '▲' : '▼'} {Math.abs(delta)}%
        </span>
      </div>
      <div className="text-[12.5px] text-ink-500 font-medium">{label}</div>
      <div className="flex items-baseline gap-2 mt-0.5">
        <div className="display text-[26px] font-extrabold text-ink tnum leading-none">
          {formattedValue}
        </div>
      </div>
      <div className="text-[11px] text-ink-400 mt-1">{sub}</div>
    </div>
  );
}
