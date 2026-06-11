import { useAuthStore } from '@/store/auth';
import { NAV_USER, NAV_ADMIN } from '@/constants/nav';
import { Icon } from '@/components/ui';
import NavItem from './NavItem';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navItems = user?.role === 'ADMIN' ? NAV_ADMIN : NAV_USER;

  return (
    <aside className="h-screen w-[240px] bg-navy flex flex-col">
      <div className="h-[64px] px-5 flex items-center gap-2 shrink-0">
        <Icon name="spark2" size={20} className="text-brand" />
        <span className="text-white font-semibold text-[17px]">NewsPulse</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-white/10 shrink-0">
          <p className="text-ink-400 text-sm truncate mb-2">{user.nickname}</p>
          <button
            onClick={logout}
            className="text-ink-400 hover:text-white text-sm cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      )}
    </aside>
  );
}
