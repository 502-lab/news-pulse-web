import type { ReactNode } from 'react';
import Icon from './Icon';

interface EmptyStateProps {
  title: string;
  sub: string;
  action?: ReactNode;
}

export default function EmptyState({ title, sub, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center fadeup">
      <div className="relative w-28 h-28 mb-5">
        <div className="absolute inset-0 rounded-full bg-brand-50" />
        <div className="absolute inset-3 rounded-full stripes opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center text-brand">
          <Icon name="inbox" size={40} stroke={1.5} />
        </div>
      </div>
      <h3 className="text-[16px] font-bold text-ink">{title}</h3>
      <p className="text-[13px] text-ink-400 mt-1 max-w-xs">{sub}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
