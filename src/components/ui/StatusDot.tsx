type StatusType = 'running' | 'idle' | 'warning' | 'error';

interface StatusDotProps {
  status: StatusType;
}

const STATUS_MAP: Record<StatusType, { color: string; label: string; pulse: boolean }> = {
  running: { color: '#10B981', label: '실행 중', pulse: true },
  idle: { color: '#94A3B8', label: '대기', pulse: false },
  warning: { color: '#F59E0B', label: '경고', pulse: true },
  error: { color: '#EF4444', label: '오류', pulse: true },
};

export default function StatusDot({ status }: StatusDotProps) {
  const { color, label, pulse } = STATUS_MAP[status];

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex w-2.5 h-2.5">
        {pulse && (
          <span
            className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
            style={{ background: color }}
          />
        )}
        <span
          className="relative inline-flex w-2.5 h-2.5 rounded-full"
          style={{ background: color }}
        />
      </span>
      <span className="text-[12.5px] font-semibold" style={{ color }}>
        {label}
      </span>
    </span>
  );
}
