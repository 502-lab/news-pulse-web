import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  pad?: boolean;
  hover?: boolean;
}

export function Card({ children, className = '', pad = true, hover = false }: CardProps) {
  return (
    <div
      className={[
        'bg-white border border-ink-200 rounded-card',
        pad ? 'p-5' : '',
        hover
          ? 'transition-all hover:border-brand/40 hover:shadow-cardhover'
          : 'shadow-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

interface CardHeadProps {
  title: string;
  sub?: string;
  right?: ReactNode;
}

export function CardHead({ title, sub, right }: CardHeadProps) {
  return (
    <div className="flex items-start justify-between gap-2 mb-4">
      <div className="min-w-0">
        <h3 className="display text-[15px] font-bold text-ink leading-tight">{title}</h3>
        {sub && <p className="text-[12px] text-ink-400 mt-0.5">{sub}</p>}
      </div>
      {right && <div className="shrink-0 whitespace-nowrap">{right}</div>}
    </div>
  );
}
