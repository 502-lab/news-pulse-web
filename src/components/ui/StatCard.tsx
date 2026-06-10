import Icon from './Icon';
import type { StatCardData } from '@/types/news';

interface StatCardProps {
  data: StatCardData;
  loading?: boolean;
}

const TONE_MAP: Record<StatCardData['tone'], { iconColor: string; iconBg: string }> = {
  brand: { iconColor: '#6366F1', iconBg: '#EEF0FF' },
  cyan: { iconColor: '#06B6D4', iconBg: '#ECFEFF' },
  ok: { iconColor: '#10B981', iconBg: '#ECFDF5' },
  warn: { iconColor: '#F59E0B', iconBg: '#FFF7ED' },
};

export default function StatCard({ data, loading = false }: StatCardProps) {
  const { label, sub, value, delta, fmt, icon, tone } = data;
  const { iconColor, iconBg } = TONE_MAP[tone];

  const formattedValue =
    fmt === 'pct' ? value.toFixed(2) + '%' : value.toLocaleString('ko-KR');

  return (
    <div className="bg-white border border-ink-200 rounded-card shadow-card p-5 transition-all hover:border-brand/40 hover:shadow-cardhover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {loading ? (
            <>
              <div className="skel h-3 w-20 rounded mb-2" />
              <div className="skel h-7 w-24 rounded" />
            </>
          ) : (
            <>
              <p className="text-[12px] text-ink-500 font-medium">{label}</p>
              <p className="text-[11px] text-ink-400 mt-0.5 mb-1">{sub}</p>
              <p className="text-[26px] font-bold text-ink tnum leading-none">{formattedValue}</p>
            </>
          )}
          {!loading && (
            <p className={`text-[12px] font-medium mt-1.5 tnum ${delta >= 0 ? 'text-ok' : 'text-danger'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
            </p>
          )}
        </div>
        {loading ? (
          <div className="skel h-9 w-9 rounded-lg shrink-0" />
        ) : (
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: iconBg, color: iconColor }}
            aria-hidden="true"
          >
            <Icon name={icon} size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
