type SegmentedOption = string | { v: string; label: string };

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';
}

function getV(opt: SegmentedOption) {
  return typeof opt === 'string' ? opt : opt.v;
}

function getLabel(opt: SegmentedOption) {
  return typeof opt === 'string' ? opt : opt.label;
}

export default function Segmented({ options, value, onChange, size = 'md' }: SegmentedProps) {
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-[12.5px]' : 'px-3.5 py-1.5 text-[13px]';

  return (
    <div className="inline-flex p-0.5 bg-ink-100 rounded-btn" role="tablist">
      {options.map((opt) => {
        const v = getV(opt);
        const label = getLabel(opt);
        const active = v === value;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={[
              sizeClass,
              'font-semibold transition-all rounded-[5px]',
              active
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink-500 hover:text-ink-700',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
