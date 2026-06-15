import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from './setup';
import { useAuthStore } from '@/stores/authStore';
import AuthShell from '@/components/layout/AuthShell';
import RegisterPage from '@/pages/auth/RegisterPage';

const BASE = 'http://localhost:8080';

const mockTerms = [
  { id: 'svc-1', type: 'SERVICE', version: '1.0', effectiveDate: '2026-01-01', isRequired: true, isActive: true },
  { id: 'prv-1', type: 'PRIVACY', version: '1.0', effectiveDate: '2026-01-01', isRequired: true, isActive: true },
  { id: 'mkt-1', type: 'MARKETING', version: '1.0', effectiveDate: '2026-01-01', isRequired: false, isActive: true },
];

const newUser = {
  id: 'u2',
  email: 'new@example.com',
  role: 'USER' as const,
  emailVerified: false,
  onboardingCompleted: false,
  requiresReConsent: false,
  signupType: 'EMAIL' as const,
  createdAt: '2026-06-15T00:00:00Z',
};

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderRegister() {
  const routes = [
    {
      element: <AuthShell />,
      children: [
        { path: '/register', element: <RegisterPage /> },
        { path: '/login', element: <div data-testid="login">Login</div> },
      ],
    },
    { path: '/verify-email', element: <div data-testid="verify-email">VerifyEmail</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ['/register'] });
  return render(
    <QueryClientProvider client={makeClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
    server.use(
      http.get(`${BASE}/api/v1/terms`, () => HttpResponse.json(mockTerms)),
    );
  });

  it('약관 체크박스가 로드된다', async () => {
    renderRegister();
    await waitFor(() => {
      // 체크박스 레이블로 확인 (링크와 구분)
      expect(screen.getByLabelText(/서비스 이용약관/)).toBeInTheDocument();
      expect(screen.getByLabelText(/개인정보처리방침/)).toBeInTheDocument();
      expect(screen.getByText(/마케팅/)).toBeInTheDocument();
      expect(screen.getByText(/만 14세/)).toBeInTheDocument();
    });
  });

  it('만 14세 미동의 시 제출 차단', async () => {
    const user = userEvent.setup();
    renderRegister();
    await waitFor(() => screen.getByText(/서비스 이용약관/));

    await user.type(screen.getByLabelText('이메일'), 'new@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'Password1');
    // 모두동의 클릭 → 전체 체크
    await user.click(screen.getByLabelText('전체 동의'));
    // 만14세 해제
    await user.click(screen.getByLabelText(/만 14세/));

    await user.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('필수 약관에 모두 동의해주세요.')).toBeInTheDocument();
    });
  });

  it('중복 이메일(409) → 이메일 필드 오류', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/signup`, () => new HttpResponse(null, { status: 409 })),
    );
    const user = userEvent.setup();
    renderRegister();
    await waitFor(() => screen.getByText(/서비스 이용약관/));

    await user.type(screen.getByLabelText('이메일'), 'dup@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'Password1');
    await user.click(screen.getByLabelText('전체 동의'));

    await user.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
    });
  });

  it('가입 성공 → /verify-email 이동', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/signup`, () =>
        HttpResponse.json(
          { account: newUser, tokens: { accessToken: 'acc', refreshToken: 'ref' } },
          { status: 201 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderRegister();
    await waitFor(() => screen.getByText(/서비스 이용약관/));

    await user.type(screen.getByLabelText('이메일'), 'new@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'Password1');
    await user.click(screen.getByLabelText('전체 동의'));

    await user.click(screen.getByRole('button', { name: '가입하기' }));
    await waitFor(() => {
      expect(screen.getByTestId('verify-email')).toBeInTheDocument();
    });
  });
});
