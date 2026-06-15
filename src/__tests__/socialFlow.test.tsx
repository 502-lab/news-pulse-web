import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { useAuthStore } from '@/stores/authStore';
import AuthShell from '@/components/layout/AuthShell';
import SocialCallbackPage from '@/pages/auth/SocialCallbackPage';
import SocialConsentPage from '@/pages/auth/SocialConsentPage';

const BASE = 'http://localhost:8080';

const mockUser = {
  id: 'u1',
  email: 'kakao@example.com',
  role: 'USER' as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: 'SOCIAL' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockTokens = { accessToken: 'acc', refreshToken: 'ref', expiresIn: 3600 };

const mockTerms = [
  { id: 't1', type: 'SERVICE', version: '1.0', isRequired: true, publishedAt: '2026-01-01T00:00:00Z' },
  { id: 't2', type: 'PRIVACY', version: '1.0', isRequired: true, publishedAt: '2026-01-01T00:00:00Z' },
];

const resetStore = () =>
  useAuthStore.setState({ user: null, accessToken: null, isLoading: false });

// 카카오 기존 유저 (200) 흐름
describe('소셜 콜백 — 카카오 기존 유저 (200)', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
    sessionStorage.setItem('oauth_provider', 'kakao');

    server.use(
      http.post(`${BASE}/api/v1/auth/social/kakao/callback`, () =>
        HttpResponse.json({ isNew: false, account: mockUser, tokens: mockTokens }),
      ),
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('200 응답 시 /home으로 이동하고 oauth_provider 삭제', async () => {
    const routes = [
      {
        element: <AuthShell />,
        children: [
          {
            path: '/oauth/callback',
            element: <SocialCallbackPage />,
          },
        ],
      },
      { path: '/home', element: <div data-testid="home">Home</div> },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/oauth/callback?code=auth_code&state=csrf_state'],
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem('oauth_provider')).toBeNull();
    expect(useAuthStore.getState().user?.email).toBe('kakao@example.com');
  });
});

// 카카오 신규 유저 (202 → consent → complete) 흐름
describe('소셜 콜백 — 카카오 신규 유저 (202 → consent → /home)', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
    sessionStorage.setItem('oauth_provider', 'kakao');

    server.use(
      http.post(`${BASE}/api/v1/auth/social/kakao/callback`, () =>
        new HttpResponse(
          JSON.stringify({
            isNew: true,
            pendingToken: 'pending-jwt-token',
            requiredTerms: mockTerms,
          }),
          { status: 202, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
      http.post(`${BASE}/api/v1/auth/social/complete`, () =>
        HttpResponse.json({ account: mockUser, tokens: mockTokens }, { status: 201 }),
      ),
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('202 → /social-consent 이동, oauth_provider 삭제', async () => {
    const routes = [
      {
        element: <AuthShell />,
        children: [
          { path: '/oauth/callback', element: <SocialCallbackPage /> },
          { path: '/social-consent', element: <div data-testid="consent-page">Consent</div> },
        ],
      },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/oauth/callback?code=auth_code&state=csrf_state'],
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('consent-page')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem('oauth_provider')).toBeNull();
  });

  it('SocialConsentPage: 약관 동의 후 completeSocialSignup → /home', async () => {
    const user = userEvent.setup();
    const routes = [
      {
        element: <AuthShell />,
        children: [
          { path: '/oauth/callback', element: <SocialCallbackPage /> },
          { path: '/social-consent', element: <SocialConsentPage /> },
        ],
      },
      { path: '/home', element: <div data-testid="home">Home</div> },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/oauth/callback?code=auth_code&state=csrf_state'],
    });
    render(<RouterProvider router={router} />);

    // 202 처리 후 /social-consent 이동 대기
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /가입을 완료하려면/i })).toBeInTheDocument();
    });

    // "전체 동의" 체크박스 클릭
    await user.click(screen.getByRole('checkbox', { name: '전체 동의' }));

    // "가입 완료" 버튼 클릭
    await user.click(screen.getByRole('button', { name: '가입 완료' }));

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    expect(useAuthStore.getState().user?.email).toBe('kakao@example.com');
  });
});

// provider 없는 경우 → /login 리다이렉트
describe('SocialCallbackPage — oauth_provider 없음', () => {
  beforeEach(() => {
    resetStore();
    sessionStorage.clear();
  });

  it('sessionStorage에 oauth_provider 없으면 /login으로 이동', async () => {
    const routes = [
      {
        element: <AuthShell />,
        children: [
          { path: '/oauth/callback', element: <SocialCallbackPage /> },
          { path: '/login', element: <div data-testid="login">Login</div> },
        ],
      },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/oauth/callback?code=auth_code&state=csrf_state'],
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });
});

// 400 CSRF 오류 분기
describe('SocialCallbackPage — 400 CSRF 오류', () => {
  beforeEach(() => {
    resetStore();
    sessionStorage.setItem('oauth_provider', 'kakao');

    server.use(
      http.post(`${BASE}/api/v1/auth/social/kakao/callback`, () =>
        new HttpResponse(
          JSON.stringify({ code: 'INVALID_STATE', message: 'state mismatch' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
  });

  afterEach(() => sessionStorage.clear());

  it('400 응답 시 CSRF 오류 메시지 표시', async () => {
    const routes = [
      {
        element: <AuthShell />,
        children: [{ path: '/oauth/callback', element: <SocialCallbackPage /> }],
      },
      { path: '/login', element: <div>Login</div> },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/oauth/callback?code=bad_code&state=bad_state'],
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(
        screen.getByText('인증 세션이 유효하지 않습니다. 다시 시도해주세요.'),
      ).toBeInTheDocument();
    });
  });
});

// 409 이메일 충돌 분기
describe('SocialCallbackPage — 409 이메일 충돌', () => {
  beforeEach(() => {
    resetStore();
    sessionStorage.setItem('oauth_provider', 'kakao');

    server.use(
      http.post(`${BASE}/api/v1/auth/social/kakao/callback`, () =>
        new HttpResponse(
          JSON.stringify({ code: 'EMAIL_CONFLICT', message: 'email already exists' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
  });

  afterEach(() => sessionStorage.clear());

  it('409 응답 시 이메일 충돌 메시지 표시', async () => {
    const routes = [
      {
        element: <AuthShell />,
        children: [{ path: '/oauth/callback', element: <SocialCallbackPage /> }],
      },
      { path: '/login', element: <div>Login</div> },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/oauth/callback?code=dup_code&state=csrf_state'],
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(
        screen.getByText('해당 이메일로 가입된 계정이 있습니다. 이메일로 로그인해 주세요.'),
      ).toBeInTheDocument();
    });
  });
});

// SocialConsentPage — pendingToken 없으면 /login
describe('SocialConsentPage — pendingToken 없음', () => {
  beforeEach(() => resetStore());

  it('state 없으면 /login으로 이동', async () => {
    const routes = [
      {
        element: <AuthShell />,
        children: [{ path: '/social-consent', element: <SocialConsentPage /> }],
      },
      { path: '/login', element: <div data-testid="login">Login</div> },
    ];
    const router = createMemoryRouter(routes, {
      initialEntries: ['/social-consent'],
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });
});
