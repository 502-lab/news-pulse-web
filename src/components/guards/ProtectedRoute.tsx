import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to="/login" state={{ returnTo }} replace />;
  }

  return <Outlet />;
}
