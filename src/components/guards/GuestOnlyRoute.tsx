import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import FullPageSpinner from "@/components/common/FullPageSpinner";
import { resolvePostLoginDest } from "@/lib/resolvePostLoginDest";

export default function GuestOnlyRoute() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (user) {
    return <Navigate to={resolvePostLoginDest(user, location.state)} replace />;
  }

  return <Outlet />;
}
