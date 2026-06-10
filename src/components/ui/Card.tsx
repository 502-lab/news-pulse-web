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
        'bg-white border border-ink-200 rounded-card shadow-card',
        pad ? 'p-5' : '',
        hover ? 'transition-all hover:border-brand/40 hover:shadow-cardhover' : '',
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
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-[15px] font-bold text-ink">{title}</p>
        {sub && <p className="text-[12px] text-ink-400 mt-0.5">{sub}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
