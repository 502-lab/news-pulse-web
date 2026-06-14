interface ToggleProps {
  on: boolean;
  onChange?: (on: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export default function Toggle({ on, onChange, disabled, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={[
        'relative w-10 h-6 rounded-full inline-block transition-colors',
        on ? 'bg-brand' : 'bg-ink-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
          on ? 'left-[18px]' : 'left-0.5',
        ].join(' ')}
      />
    </button>
  );
}
