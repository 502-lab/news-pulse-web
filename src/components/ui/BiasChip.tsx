interface BiasChipProps {
  score: number;
}

const BIAS_CONFIG = {
  liberal: { label: '진보', fg: '#2563EB', bg: '#EFF6FF' },
  neutral: { label: '중립', fg: '#64748B', bg: '#F1F5F9' },
  conservative: { label: '보수', fg: '#DC2626', bg: '#FEF2F2' },
} as const;

export default function BiasChip({ score }: BiasChipProps) {
  let key: keyof typeof BIAS_CONFIG;
  if (score <= -10) key = 'liberal';
  else if (score >= 10) key = 'conservative';
  else key = 'neutral';

  const { label, fg, bg } = BIAS_CONFIG[key];
  const showScore = key !== 'neutral' && score !== 0;
  const display = showScore
    ? `${label} ${score > 0 ? '+' : ''}${score}`
    : label;

  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded-btn leading-none"
      style={{ color: fg, background: bg }}
    >
      {display}
    </span>
  );
}
