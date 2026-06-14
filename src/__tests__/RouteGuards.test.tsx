import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import GuestOnlyRoute from '@/components/guards/GuestOnlyRoute';

function resetStore() {
  useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
}

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  role: 'USER' as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: 'EMAIL' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

function renderRouter(routes: Parameters<typeof createMemoryRouter>[0], initialEntries: string[]) {
  const router = createMemoryRouter(routes, { initialEntries });
  return render(<RouterProvider router={router} />);
}

describe('ProtectedRoute', () => {
  beforeEach(resetStore);

  it('미인증 사용자를 /login?returnTo 로 리다이렉트', () => {
    const routes = [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/home', element: <div>Home</div> }],
      },
      { path: '/login', element: <div data-testid="login-page">Login</div> },
    ];

    renderRouter(routes, ['/home']);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('isLoading=true 일 때 리다이렉트 없이 스피너만 렌더', () => {
    useAuthStore.setState({ isLoading: true });

    const routes = [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/home', element: <div>Home</div> }],
      },
      { path: '/login', element: <div data-testid="login-page">Login</div> },
    ];

    renderRouter(routes, ['/home']);
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('인증 사용자는 보호 경로를 정상 렌더', () => {
    useAuthStore.setState({ user: mockUser, accessToken: 'tok' });

    const routes = [
      {
        element: <ProtectedRoute />,
        children: [{ path: '/home', element: <div data-testid="home-page">Home</div> }],
      },
    ];

    renderRouter(routes, ['/home']);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});

describe('GuestOnlyRoute', () => {
  beforeEach(resetStore);

  it('게스트는 /login 정상 접근', () => {
    const routes = [
      {
        element: <GuestOnlyRoute />,
        children: [{ path: '/login', element: <div data-testid="login-page">Login</div> }],
      },
    ];

    renderRouter(routes, ['/login']);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('USER 인증 사용자는 /login 접근 시 /home 으로 리다이렉트', () => {
    useAuthStore.setState({ user: mockUser, accessToken: 'tok' });

    const routes = [
      {
        element: <GuestOnlyRoute />,
        children: [{ path: '/login', element: <div>Login</div> }],
      },
      { path: '/home', element: <div data-testid="home-page">Home</div> },
    ];

    renderRouter(routes, ['/login']);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('ADMIN 인증 사용자는 /login 접근 시 /admin 으로 리다이렉트', () => {
    useAuthStore.setState({ user: { ...mockUser, role: 'ADMIN' }, accessToken: 'tok' });

    const routes = [
      {
        element: <GuestOnlyRoute />,
        children: [{ path: '/login', element: <div>Login</div> }],
      },
      { path: '/admin', element: <div data-testid="admin-page">Admin</div> },
    ];

    renderRouter(routes, ['/login']);
    expect(screen.getByTestId('admin-page')).toBeInTheDocument();
  });
});
