type StatusType = 'running' | 'idle' | 'warning' | 'error';

interface StatusDotProps {
  status: StatusType;
}

const STATUS_MAP: Record<StatusType, { color: string; label: string; ping: boolean }> = {
  running: { color: '#10B981', label: '실행 중', ping: true },
  idle: { color: '#94A3B8', label: '대기', ping: false },
  warning: { color: '#F59E0B', label: '경고', ping: true },
  error: { color: '#EF4444', label: '오류', ping: true },
};

export default function StatusDot({ status }: StatusDotProps) {
  const { color, label, ping } = STATUS_MAP[status];

  return (
    <div className="flex items-center gap-1.5" aria-label={label} title={label}>
      <div className="relative flex h-2.5 w-2.5">
        {ping && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ background: color }}
        />
      </div>
      <span className="text-[12px] text-ink-500">{label}</span>
    </div>
  );
}
