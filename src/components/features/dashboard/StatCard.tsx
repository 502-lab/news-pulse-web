import clsx from 'clsx';
import Icon from '@/components/ui/Icon';
import type { DashboardStat } from '@/types/dashboard';

interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  const deltaIcon =
    stat.delta > 0 ? 'ArrowUpRight' : stat.delta < 0 ? 'ArrowDownRight' : 'Minus';

  const deltaClass = clsx('flex items-center gap-1 text-sm font-medium', {
    'text-green-500': stat.delta > 0,
    'text-red-500': stat.delta < 0,
    'text-gray-400': stat.delta === 0,
  });

  const sign = stat.delta > 0 ? '+' : '';

  return (
    <article
      aria-label={stat.label}
      className="bg-white/5 rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <Icon name={stat.icon} size={18} className="text-brand" />
        <h3 className="text-ink-400 text-sm">{stat.label}</h3>
      </div>
      <p className="text-3xl font-bold text-ink tnum">{stat.value.toLocaleString()}</p>
      <div className={deltaClass}>
        <Icon name={deltaIcon} size={14} aria-hidden="true" />
        <span>
          {sign}{stat.delta} ({sign}{stat.deltaPercent}%)
        </span>
        <span className="text-ink-400 font-normal">전일 대비</span>
      </div>
    </article>
  );
}
