import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { logout as logoutApi } from "@/lib/api/auth";
import { getRefreshToken } from "@/lib/tokenStorage";

const NAV_TABS = [
  { to: "/home", label: "홈" },
  { to: "/trends", label: "트렌드" },
  { to: "/bias", label: "편향분석" },
  { to: "/insights", label: "인사이트" },
  { to: "/weekly", label: "브리핑" },
];

export default function UserGnbLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    const rt = getRefreshToken();
    if (rt) {
      try {
        await logoutApi(rt);
      } catch {
        /* 서버 오류 무관하게 클라이언트 초기화 */
      }
    }
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="h-14 bg-white border-b border-ink-200 shadow-card flex items-center px-6 gap-4">
        <span className="text-brand font-bold text-lg">Newsift</span>

        <nav aria-label="주요 메뉴" className="flex items-center gap-1 flex-1">
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                "px-3 py-1.5 rounded-btn text-sm font-medium transition-colors " +
                (isActive
                  ? "text-brand bg-brand-50"
                  : "text-ink-500 hover:text-ink hover:bg-ink-100")
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* 검색 — MVP 숨김 */}
        <button
          aria-hidden="true"
          className="opacity-0 pointer-events-none p-2"
          tabIndex={-1}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="7.5"
              cy="7.5"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M13 13L16 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-500 hidden md:block">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            aria-label="로그아웃"
            className="px-3 py-1.5 text-sm text-ink-500 hover:text-danger hover:bg-ink-100 rounded-btn transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
