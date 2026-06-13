import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  children?: ReactNode;
}

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary: 'bg-brand hover:bg-brand-600 text-white shadow-sm',
  secondary: 'bg-white border border-ink-200 hover:border-ink-300 text-ink-700',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'border border-danger/30 text-danger hover:bg-danger/5',
};

const SIZE_MAP: Record<ButtonSize, string> = {
  md: 'text-[14px] px-4 py-2.5',
  sm: 'text-[12.5px] px-3 py-1.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const variantClass = disabled
    ? 'bg-ink-300 text-white cursor-not-allowed'
    : VARIANT_MAP[variant];

  return (
    <button
      className={[
        'inline-flex items-center gap-1.5 font-bold rounded-btn transition-colors',
        SIZE_MAP[size],
        variantClass,
        className,
      ].join(' ')}
      disabled={disabled}
      {...props}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}
