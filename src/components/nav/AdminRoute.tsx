import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export default function AdminRoute() {
  const { user } = useAuthStore();

  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
