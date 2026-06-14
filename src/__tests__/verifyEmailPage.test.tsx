import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { useAuthStore } from '@/stores/authStore';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import GateRoute from '@/components/guards/GateRoute';
import AuthShell from '@/components/layout/AuthShell';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

const BASE = 'http://localhost:8080';

const unverifiedUser = {
  id: 'u3',
  email: 'new@example.com',
  role: 'USER' as const,
  emailVerified: false,
  onboardingCompleted: false,
  requiresReConsent: false,
  signupType: 'EMAIL' as const,
  createdAt: '2026-06-15T00:00:00Z',
};

function renderVerifyFlow() {
  const routes = [
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AuthShell />,
          children: [{ path: '/verify-email', element: <VerifyEmailPage /> }],
        },
        { path: '/onboarding', element: <div data-testid="onboarding">Onboarding</div> },
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
  const router = createMemoryRouter(routes, { initialEntries: ['/verify-email'] });
  return render(<RouterProvider router={router} />);
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: unverifiedUser,
      accessToken: 'acc',
      isLoading: false,
    });
  });

  it('이메일 주소와 인증 코드 입력 필드가 렌더된다', () => {
    renderVerifyFlow();
    expect(screen.getByText('new@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('인증 코드')).toBeInTheDocument();
  });

  it('잘못된 코드(400) → 코드 오류 메시지', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/email-verification/verify`, () =>
        new HttpResponse(null, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderVerifyFlow();

    await user.type(screen.getByLabelText('인증 코드'), '000000');
    await user.click(screen.getByRole('button', { name: '인증 확인' }));
    await waitFor(() => {
      expect(screen.getByText('인증 코드가 올바르지 않습니다.')).toBeInTheDocument();
    });
  });

  it('만료 코드(422) → 만료 메시지', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/email-verification/verify`, () =>
        new HttpResponse(null, { status: 422 }),
      ),
    );
    const user = userEvent.setup();
    renderVerifyFlow();

    await user.type(screen.getByLabelText('인증 코드'), '111111');
    await user.click(screen.getByRole('button', { name: '인증 확인' }));
    await waitFor(() => {
      expect(screen.getByText(/만료됐습니다/)).toBeInTheDocument();
    });
  });

  it('재발송 버튼 클릭 → 성공 안내 메시지', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/email-verification/request`, () =>
        new HttpResponse(null, { status: 200 }),
      ),
    );
    const user = userEvent.setup();
    renderVerifyFlow();

    await user.click(screen.getByRole('button', { name: '인증 메일 재발송' }));
    await waitFor(() => {
      expect(screen.getByText('인증 메일이 재발송됐습니다.')).toBeInTheDocument();
    });
  });

  it('E2E: 인증 성공 → authStore emailVerified=true → GateRoute → /onboarding 이동', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/email-verification/verify`, () =>
        HttpResponse.json({ emailVerified: true }),
      ),
    );
    const user = userEvent.setup();
    renderVerifyFlow();

    await user.type(screen.getByLabelText('인증 코드'), '123456');
    await user.click(screen.getByRole('button', { name: '인증 확인' }));

    await waitFor(() => {
      expect(screen.getByTestId('onboarding')).toBeInTheDocument();
    });
  });
});
