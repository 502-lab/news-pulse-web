import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
