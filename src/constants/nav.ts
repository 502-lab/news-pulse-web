export interface NavItemDef {
  to: string;
  icon: string;
  label: string;
}

export const NAV_USER: NavItemDef[] = [
  { to: '/',       icon: 'LayoutDashboard', label: '대시보드' },
  { to: '/trends', icon: 'TrendingUp',      label: '트렌드 분석' },
  { to: '/bias',   icon: 'Scale',           label: '편향 분석' },
];

export const NAV_ADMIN: NavItemDef[] = [
  ...NAV_USER,
  { to: '/admin/monitor', icon: 'Activity', label: '시스템 모니터링' },
  { to: '/admin/users',   icon: 'Users',    label: '사용자 관리' },
];
