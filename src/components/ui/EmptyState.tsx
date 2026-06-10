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
      <div className="relative mb-4">
        <div className="stripes h-16 w-16 rounded-full flex items-center justify-center">
          <div className="h-12 w-12 bg-white/80 rounded-full flex items-center justify-center">
            <Icon name="inbox" size={28} className="text-ink-400" stroke={1.5} />
          </div>
        </div>
      </div>
      <p className="text-[16px] font-bold text-ink">{title}</p>
      <p className="text-[13px] text-ink-400 mt-1 max-w-xs">{sub}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
