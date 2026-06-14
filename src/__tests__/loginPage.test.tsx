import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { useAuthStore } from '@/stores/authStore';
import AuthShell from '@/components/layout/AuthShell';
import GuestOnlyRoute from '@/components/guards/GuestOnlyRoute';
import LoginPage from '@/pages/auth/LoginPage';

const BASE = 'http://localhost:8080';

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

const mockAdmin = {
  id: 'a1',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: 'EMAIL' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockTokens = { accessToken: 'acc', refreshToken: 'ref' };

// GuestOnlyRoute 포함 라우터 (프로덕션과 동일한 구조)
function renderLoginWithGuest(initialEntry: string | { pathname: string; state: unknown } = '/login') {
  const routes = [
    {
      element: <GuestOnlyRoute />,
      children: [
        {
          element: <AuthShell />,
          children: [{ path: '/login', element: <LoginPage /> }],
        },
      ],
    },
    { path: '/home', element: <div data-testid="home">Home</div> },
    { path: '/admin', element: <div data-testid="admin">Admin</div> },
    { path: '/insight', element: <div data-testid="insight">Insight</div> },
    { path: '/trends', element: <div data-testid="trends">Trends</div> },
    { path: '/register', element: <div>Register</div> },
    { path: '/forgot-password', element: <div>ForgotPw</div> },
    { path: '/terms', element: <div>Terms</div> },
    { path: '/privacy', element: <div>Privacy</div> },
  ];
  const entries = typeof initialEntry === 'string' ? [initialEntry] : [initialEntry];
  const router = createMemoryRouter(routes, { initialEntries: entries });
  return render(<RouterProvider router={router} />);
}

function renderLogin(initialPath = '/login') {
  const routes = [
    {
      element: <GuestOnlyRoute />,
      children: [
        {
          element: <AuthShell />,
          children: [{ path: '/login', element: <LoginPage /> }],
        },
      ],
    },
    { path: '/home', element: <div data-testid="home">Home</div> },
    { path: '/register', element: <div>Register</div> },
    { path: '/forgot-password', element: <div>ForgotPw</div> },
    { path: '/terms', element: <div>Terms</div> },
    { path: '/privacy', element: <div>Privacy</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  return render(<RouterProvider router={router} />);
}

const resetStore = () =>
  useAuthStore.setState({ user: null, accessToken: null, isLoading: false });

// ── GuestOnlyRoute + returnTo 경쟁 조건 수정 검증 ──────────────────────────────
describe('GuestOnlyRoute + returnTo 경쟁 조건 수정', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ account: mockUser, tokens: mockTokens }),
      ),
    );
  });
  afterEach(() => { vi.useRealTimers(); localStorage.clear(); });

  it('GuestOnlyRoute 포함 returnTo=/insight → 로그인 후 /insight 도달', async () => {
    const user = userEvent.setup();
    renderLoginWithGuest({ pathname: '/login', state: { returnTo: '/insight' } });

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByTestId('insight')).toBeInTheDocument();
    });
  });

  // 회귀: returnTo 없는 일반 USER 로그인 → /home (GuestOnlyRoute 포함)
  it('[회귀] returnTo 없음·USER → GuestOnlyRoute 포함에서도 /home 도달', async () => {
    const user = userEvent.setup();
    renderLoginWithGuest('/login');

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });

  // 회귀: ADMIN 로그인 → /admin
  it('[회귀] ADMIN 로그인 → /admin 도달', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ account: mockAdmin, tokens: mockTokens }),
      ),
    );
    const user = userEvent.setup();
    renderLoginWithGuest('/login');

    await user.type(screen.getByLabelText('이메일'), 'admin@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toBeInTheDocument();
    });
  });

  // returnTo 안전성: 차단 경로를 returnTo로 전달하면 roleHome으로 fallback
  it('[안전성] returnTo=/verify-email (차단 경로) → /home으로 fallback', async () => {
    const user = userEvent.setup();
    renderLoginWithGuest({ pathname: '/login', state: { returnTo: '/verify-email' } });

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });
});
// ─────────────────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('로그인 폼이 렌더된다', () => {
    renderLogin();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('빈 입력으로 제출 시 유효성 오류 표시 (서버 요청 없음)', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
  });

  it('잘못된 자격증명 시 오류 메시지 표시', async () => {
    // refresh token 필요: 401 수신 시 interceptor가 refresh 시도 → 성공 → login 재시도 → 401(_retry=true) → AxiosError 전파
    localStorage.setItem('rt', 'mock-rt');
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () => new HttpResponse(null, { status: 401 })),
    );
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('이메일'), 'wrong@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpw');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
      ).toBeInTheDocument();
    });
  });

  // SC-001: 500ms 이내 이동은 unit 환경에서 측정 불가, 대신 navigate 완료 여부로 검증
  it('SC-001: 로그인 성공 후 /home으로 이동', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ account: mockUser, tokens: mockTokens }),
      ),
    );
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });

  it('returnTo가 있으면 로그인 후 해당 경로로 이동', async () => {
    // GuestOnlyRoute는 이 테스트 대상이 아님(별도 guard 테스트에서 커버).
    // returnTo 동작: LoginPage가 location.state.returnTo를 읽어 navigate 하는지만 검증.
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ account: mockUser, tokens: mockTokens }),
      ),
    );
    const user = userEvent.setup();
    const routes = [
      {
        element: <AuthShell />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      { path: '/home', element: <div>Home</div> },
      { path: '/trends', element: <div data-testid="trends">Trends</div> },
      { path: '/terms', element: <div>Terms</div> },
      { path: '/privacy', element: <div>Privacy</div> },
      { path: '/register', element: <div>Register</div> },
      { path: '/forgot-password', element: <div>ForgotPw</div> },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: [{ pathname: '/login', state: { returnTo: '/trends' } }],
    });
    render(<RouterProvider router={router} />);
    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'Password1');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByTestId('trends')).toBeInTheDocument();
    });
  });
});
