interface BiasChipProps {
  score: number;
}

export default function BiasChip({ score }: BiasChipProps) {
  const left = score < -10;
  const right = score > 10;
  const col = left ? '#2563EB' : right ? '#DC2626' : '#64748B';
  const bg = left ? '#EFF6FF' : right ? '#FEF2F2' : '#F1F5F9';
  const label = Math.abs(score) <= 10 ? '중립' : left ? '진보' : '보수';

  return (
    <span
      className="inline-flex items-center gap-1 rounded-btn px-2 py-0.5 text-[11.5px] font-semibold tnum"
      style={{ color: col, background: bg }}
    >
      {label} {score > 0 ? '+' : ''}{score}
    </span>
  );
}
