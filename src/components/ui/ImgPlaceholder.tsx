interface ImgPlaceholderProps {
  label: string;
  className?: string;
  ratio?: string;
}

export default function ImgPlaceholder({ label, className = '', ratio }: ImgPlaceholderProps) {
  return (
    <div
      className={`stripes flex items-center justify-center ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
      aria-label={label}
      role="img"
    >
      <span className="font-mono text-[11px] text-ink-400 bg-white/70 px-2 py-0.5 rounded">
        {label}
      </span>
    </div>
  );
}
