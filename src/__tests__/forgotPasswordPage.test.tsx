import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import AuthShell from '@/components/layout/AuthShell';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

const BASE = 'http://localhost:8080';

function renderForgotPw() {
  const routes = [
    {
      element: <AuthShell />,
      children: [
        { path: '/forgot-password', element: <ForgotPasswordPage /> },
        { path: '/login', element: <div data-testid="login">Login</div> },
      ],
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ['/forgot-password'] });
  return render(<RouterProvider router={router} />);
}

describe('ForgotPasswordPage — S-5 비밀번호 재설정 3단계', () => {
  beforeEach(() => {
    server.use(
      http.post(`${BASE}/api/v1/auth/password-reset/request`, () =>
        new HttpResponse(null, { status: 202 }),
      ),
      http.post(`${BASE}/api/v1/auth/password-reset/verify`, () =>
        HttpResponse.json({ resetToken: 'mock-reset-token' }),
      ),
      http.post(`${BASE}/api/v1/auth/password-reset/confirm`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );
  });

  it('폼이 렌더된다', () => {
    renderForgotPw();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '재설정 메일 발송' })).toBeInTheDocument();
  });

  it('Step1: 이메일 입력 후 발송 → Step2 전환 + 성공 메시지', async () => {
    const user = userEvent.setup();
    renderForgotPw();

    await user.type(screen.getByLabelText('이메일'), 'reset@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 발송' }));

    await waitFor(() => {
      expect(screen.getByLabelText('인증 코드')).toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toHaveTextContent('재설정 메일이 발송됐습니다');
  });

  it('빈 이메일로 발송 클릭 → 서버 요청 없이 오류 표시', async () => {
    const user = userEvent.setup();
    renderForgotPw();

    await user.click(screen.getByRole('button', { name: '재설정 메일 발송' }));
    expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
  });

  it('전체 3단계 흐름: Step1 → Step2 → Step3 → /login', async () => {
    const user = userEvent.setup();
    renderForgotPw();

    // Step 1
    await user.type(screen.getByLabelText('이메일'), 'reset@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 발송' }));

    // Step 2
    await waitFor(() => expect(screen.getByLabelText('인증 코드')).toBeInTheDocument());
    await user.type(screen.getByLabelText('인증 코드'), '123456');
    await user.click(screen.getByRole('button', { name: '코드 확인' }));

    // Step 3
    await waitFor(() => expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument());
    await user.type(screen.getByLabelText('새 비밀번호'), 'NewPass1');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'NewPass1');
    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }));

    await waitFor(() => expect(screen.getByTestId('login')).toBeInTheDocument());
  });

  it('Step2: 잘못된 코드 → 400 → 코드 오류 표시', async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/password-reset/verify`, () =>
        new HttpResponse(null, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderForgotPw();

    await user.type(screen.getByLabelText('이메일'), 'reset@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 발송' }));

    await waitFor(() => expect(screen.getByLabelText('인증 코드')).toBeInTheDocument());
    await user.type(screen.getByLabelText('인증 코드'), '999999');
    await user.click(screen.getByRole('button', { name: '코드 확인' }));

    await waitFor(() => {
      expect(screen.getByText('코드가 일치하지 않습니다.')).toBeInTheDocument();
    });
  });

  it('Step3: 비밀번호 불일치 → 제출 차단', async () => {
    const user = userEvent.setup();
    renderForgotPw();

    // Step 1 → 2
    await user.type(screen.getByLabelText('이메일'), 'reset@example.com');
    await user.click(screen.getByRole('button', { name: '재설정 메일 발송' }));
    await waitFor(() => expect(screen.getByLabelText('인증 코드')).toBeInTheDocument());
    await user.type(screen.getByLabelText('인증 코드'), '123456');
    await user.click(screen.getByRole('button', { name: '코드 확인' }));

    // Step 3
    await waitFor(() => expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument());
    await user.type(screen.getByLabelText('새 비밀번호'), 'NewPass1');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'DifferentPass2');
    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }));

    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
  });
});
