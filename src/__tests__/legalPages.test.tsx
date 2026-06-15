import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';

function renderLegalPage(path: string, element: React.ReactNode) {
  const routes = [
    // Legal 페이지는 자체 레이아웃을 가짐 (AuthShell 불필요)
    { path, element },
    { path: '/login', element: <div data-testid="login">Login</div> },
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
    renderLegalPage('/terms', <TermsPage />);

    expect(screen.getByRole('heading', { name: '이용약관' })).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('이용약관 본문이 표시된다', () => {
    renderLegalPage('/terms', <TermsPage />);
    expect(screen.getByText(/AI 뉴스 큐레이션 서비스/)).toBeInTheDocument();
  });

  it('뒤로 링크가 /login을 가리킨다', () => {
    renderLegalPage('/terms', <TermsPage />);
    const backLink = screen.getByRole('link', { name: '뒤로' });
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('TOC와 섹션이 렌더된다', () => {
    renderLegalPage('/terms', <TermsPage />);
    expect(screen.getByText('목차 · Contents')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /제1조/ })).toBeInTheDocument();
  });
});

describe('PrivacyPage — S-7 개인정보처리방침', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
  });

  it('미인증 상태에서 /privacy 접근 → 로그인 리다이렉트 없이 내용 표시', () => {
    renderLegalPage('/privacy', <PrivacyPage />);

    expect(screen.getByRole('heading', { name: '개인정보처리방침' })).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('개인정보처리방침 본문이 표시된다', () => {
    renderLegalPage('/privacy', <PrivacyPage />);
    expect(screen.getByText(/이용자의 개인정보를 중요시/)).toBeInTheDocument();
  });

  it('TOC와 섹션이 렌더된다', () => {
    renderLegalPage('/privacy', <PrivacyPage />);
    expect(screen.getByText('목차 · Contents')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /수집하는 개인정보 항목/ })).toBeInTheDocument();
  });
});
