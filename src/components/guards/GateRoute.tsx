import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import FullPageSpinner from "@/components/common/FullPageSpinner";

export default function GateRoute() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ returnTo: location.pathname + location.search }}
        replace
      />
    );
  }

  if (user.requiresReConsent) return <Navigate to="/re-consent" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
