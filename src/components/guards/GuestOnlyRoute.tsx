import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function GuestOnlyRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <FullPageSpinner />;

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/home'} replace />;
  }

  return <Outlet />;
}
