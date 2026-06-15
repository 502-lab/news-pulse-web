import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AuthShell from '@/components/layout/AuthShell';
import GuestOnlyRoute from '@/components/guards/GuestOnlyRoute';
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';

function renderPublicPage(path: string, element: React.ReactNode) {
  const routes = [
    // GuestOnlyRoute 밖의 공개 경로
    {
      element: <AuthShell />,
      children: [{ path, element }],
    },
    // GuestOnlyRoute 안 (비교용)
    {
      element: <GuestOnlyRoute />,
      children: [
        {
          element: <AuthShell />,
          children: [{ path: '/login', element: <div data-testid="login">Login</div> }],
        },
      ],
    },
    { path: '/home', element: <div data-testid="home">Home</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe('TermsPage — S-7 약관 열람', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
  });

  it('미인증 상태에서 /terms 접근 → 로그인 리다이렉트 없이 내용 표시', () => {
    renderPublicPage('/terms', <TermsPage />);

    expect(screen.getByRole('heading', { name: '서비스 이용약관' })).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('이용약관 본문이 표시된다', () => {
    renderPublicPage('/terms', <TermsPage />);
    expect(screen.getByText(/AI 뉴스 큐레이션 서비스/)).toBeInTheDocument();
  });

  it('뒤로 링크가 /login을 가리킨다', () => {
    renderPublicPage('/terms', <TermsPage />);
    const backLink = screen.getByRole('link', { name: '← 뒤로' });
    expect(backLink).toHaveAttribute('href', '/login');
  });
});

describe('PrivacyPage — S-7 개인정보처리방침', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
  });

  it('미인증 상태에서 /privacy 접근 → 로그인 리다이렉트 없이 내용 표시', () => {
    renderPublicPage('/privacy', <PrivacyPage />);

    expect(screen.getByRole('heading', { name: '개인정보처리방침' })).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('개인정보처리방침 본문이 표시된다', () => {
    renderPublicPage('/privacy', <PrivacyPage />);
    expect(screen.getByText(/이용자의 개인정보를 중요시/)).toBeInTheDocument();
  });
});
