import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import GateRoute from "@/components/guards/GateRoute";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

const baseUser = {
  id: "u1",
  email: "test@example.com",
  role: "USER" as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: "EMAIL" as const,
  createdAt: "2026-01-01T00:00:00Z",
};

const gateRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/verify-email",
        element: <div data-testid="verify-email">VerifyEmail</div>,
      },
      {
        path: "/re-consent",
        element: <div data-testid="re-consent">ReConsent</div>,
      },
      {
        path: "/onboarding",
        element: <div data-testid="onboarding">Onboarding</div>,
      },
      {
        element: <GateRoute />,
        children: [
          { path: "/home", element: <div data-testid="home">Home</div> },
          { path: "/admin", element: <div data-testid="admin">Admin</div> },
        ],
      },
    ],
  },
  { path: "/login", element: <div data-testid="login">Login</div> },
];

function renderAt(path: string) {
  const router = createMemoryRouter(gateRoutes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe("GateRoute — 접근 게이트 우선순위", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: baseUser,
      accessToken: "tok",
      isLoading: false,
    });
  });

  it("requiresReConsent=true → /re-consent", () => {
    useAuthStore.setState({ user: { ...baseUser, requiresReConsent: true } });
    renderAt("/home");
    expect(screen.getByTestId("re-consent")).toBeInTheDocument();
  });

  it("emailVerified=false → /verify-email", () => {
    useAuthStore.setState({ user: { ...baseUser, emailVerified: false } });
    renderAt("/home");
    expect(screen.getByTestId("verify-email")).toBeInTheDocument();
  });

  it("onboardingCompleted=false → /onboarding", () => {
    useAuthStore.setState({
      user: { ...baseUser, onboardingCompleted: false },
    });
    renderAt("/home");
    expect(screen.getByTestId("onboarding")).toBeInTheDocument();
  });

  it("모두 정상 + USER → /home 렌더", () => {
    renderAt("/home");
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("모두 정상 + ADMIN → /admin 렌더", () => {
    useAuthStore.setState({ user: { ...baseUser, role: "ADMIN" } });
    renderAt("/admin");
    expect(screen.getByTestId("admin")).toBeInTheDocument();
  });

  it("우선순위: requiresReConsent=true + emailVerified=false → /re-consent (첫 번째 우선)", () => {
    useAuthStore.setState({
      user: { ...baseUser, requiresReConsent: true, emailVerified: false },
    });
    renderAt("/home");
    expect(screen.getByTestId("re-consent")).toBeInTheDocument();
    expect(screen.queryByTestId("verify-email")).not.toBeInTheDocument();
  });

  it("통합: 게이트 전체 통과 + returnTo=/home state → /home 렌더 (returnTo는 ProtectedRoute가 처리)", () => {
    // GateRoute를 통과하면 목적지 컴포넌트가 정상 렌더됨을 확인
    renderAt("/home");
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });
});
