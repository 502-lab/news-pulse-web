import { CAT_COLOR, CAT_FALLBACK } from '@/constants/categories';

interface CatBadgeProps {
  cat: string;
  sm?: boolean;
}

export default function CatBadge({ cat, sm = false }: CatBadgeProps) {
  if (!cat) return null;

  const c = CAT_COLOR[cat] ?? CAT_FALLBACK;

  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-btn leading-none',
        sm ? 'text-[10.5px] px-1.5 py-0.5' : 'text-[11.5px] px-2 py-0.5',
      ].join(' ')}
      style={{ color: c.fg, background: c.bg }}
    >
      {cat}
    </span>
  );
}
