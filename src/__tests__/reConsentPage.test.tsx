import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from './setup';
import { useAuthStore } from '@/stores/authStore';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import GateRoute from '@/components/guards/GateRoute';
import ReConsentPage from '@/pages/auth/ReConsentPage';

const BASE = 'http://localhost:8080';

const mockUserReConsent = {
  id: 'u1',
  email: 'reconsent@example.com',
  role: 'USER' as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: true,
  signupType: 'EMAIL' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockTermsV2 = {
  terms: [
    { id: 'svc-2', type: 'SERVICE', version: '2.0', effectiveDate: '2026-05-01', isRequired: true, isActive: true },
  ],
};

const mockMyConsents = [
  { termsVersionId: 'svc-1', agreed: true },
];

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderReConsent() {
  useAuthStore.setState({
    user: mockUserReConsent,
    accessToken: 'mock-acc',
    isLoading: false,
  });
  const routes = [
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/re-consent', element: <ReConsentPage /> },
        {
          element: <GateRoute />,
          children: [
            { path: '/home', element: <div data-testid="home">Home</div> },
          ],
        },
      ],
    },
    { path: '/login', element: <div data-testid="login">Login</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ['/re-consent'] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('ReConsentPage — S-6 약관 재동의', () => {
  beforeEach(() => {
    server.use(
      http.get(`${BASE}/api/v1/terms`, () => HttpResponse.json(mockTermsV2)),
      http.get(`${BASE}/api/v1/me/consents`, () => HttpResponse.json(mockMyConsents)),
      http.post(`${BASE}/api/v1/me/consents`, () => HttpResponse.json([])),
      http.get(`${BASE}/api/v1/me`, () => HttpResponse.json({ ...mockUserReConsent, requiresReConsent: false })),
    );
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
    localStorage.clear();
  });

  it('재동의 필요한 약관이 표시된다', async () => {
    renderReConsent();

    await waitFor(() => {
      expect(screen.getByText('약관 재동의')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '동의하고 계속' })).toBeInTheDocument();
  });

  it('필수 동의 미완료 시 "동의하고 계속" 버튼 비활성', async () => {
    renderReConsent();

    await waitFor(() => {
      expect(screen.getByText('약관 재동의')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: '동의하고 계속' });
    expect(submitBtn).toBeDisabled();
  });

  it('"거부하고 로그아웃" 클릭 → /login 이동', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
    );
    const user = userEvent.setup();
    renderReConsent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '거부하고 로그아웃' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));

    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  it('약관 동의 후 제출 → requiresReConsent=false → /home 이동', async () => {
    const user = userEvent.setup();
    renderReConsent();

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: '전체 동의' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: '전체 동의' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '동의하고 계속' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: '동의하고 계속' }));

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });
});
