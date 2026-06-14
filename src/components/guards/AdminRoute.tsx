import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AdminRoute() {
  const { user } = useAuthStore();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
