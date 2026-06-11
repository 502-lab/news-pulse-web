import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
}

export default function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2 rounded-btn text-sm transition-colors w-full',
          isActive
            ? 'bg-brand/20 text-brand font-medium'
            : 'text-ink-400 hover:text-white hover:bg-white/5',
        ].join(' ')
      }
    >
      <Icon name={icon} size={18} />
      {label}
    </NavLink>
  );
}
