import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AdminRoute from '@/components/guards/AdminRoute';

const baseUser = {
  id: 'u1',
  email: 'test@example.com',
  role: 'USER' as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: 'EMAIL' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

function renderAt(role: 'USER' | 'ADMIN') {
  useAuthStore.setState({
    user: { ...baseUser, role },
    accessToken: 'tok',
    isLoading: false,
  });
  const routes = [
    {
      element: <AdminRoute />,
      children: [{ path: '/admin', element: <div data-testid="admin-content">Admin</div> }],
    },
    { path: '/home', element: <div data-testid="home-content">Home</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ['/admin'] });
  render(<RouterProvider router={router} />);
}

describe('AdminRoute — 역할별 접근 제어 (S-4)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
  });

  it('USER role → /home 리다이렉트', () => {
    renderAt('USER');
    expect(screen.getByTestId('home-content')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('ADMIN role → Outlet 정상 렌더', () => {
    renderAt('ADMIN');
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.queryByTestId('home-content')).not.toBeInTheDocument();
  });
});
