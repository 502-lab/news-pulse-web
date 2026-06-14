import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { logout as logoutApi } from '@/lib/api/auth';
import { getRefreshToken } from '@/lib/tokenStorage';

const SIDEBAR_MENUS = [
  { to: '/admin', label: '운영 대시보드', end: true },
  { to: '/admin/ingestion', label: '수집 관리' },
  { to: '/admin/content', label: '콘텐츠 분석' },
  { to: '/admin/users', label: '사용자 관리' },
  { to: '/admin/notice', label: '공지·알림' },
];

export default function AdminSidebarLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    const rt = getRefreshToken();
    if (rt) {
      try { await logoutApi(rt); } catch { /* 서버 오류 무관하게 클라이언트 초기화 */ }
    }
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-navy-800 flex flex-col shrink-0" aria-label="관리자 사이드바">
        <div className="h-14 flex items-center px-6 border-b border-navy-700">
          <span className="text-white font-bold text-lg">Newsift</span>
          <span className="ml-2 text-ink-400 text-xs font-medium">Admin</span>
        </div>

        <nav aria-label="관리자 메뉴" className="flex-1 px-3 py-4">
          {SIDEBAR_MENUS.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              end={menu.end}
              className={({ isActive }) =>
                'flex items-center px-3 py-2.5 rounded-btn text-sm font-medium mb-1 transition-colors ' +
                (isActive
                  ? 'bg-brand text-white'
                  : 'text-ink-400 hover:text-white hover:bg-navy-700')
              }
            >
              {menu.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-navy-700">
          <button
            onClick={handleLogout}
            aria-label="로그아웃"
            className="w-full px-3 py-2.5 text-sm text-ink-400 hover:text-white hover:bg-navy-700 rounded-btn transition-colors text-left"
          >
            로그아웃
          </button>
        </div>
      </aside>

      <main id="main-content" className="flex-1 bg-canvas overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
