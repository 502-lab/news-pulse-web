import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { login } from '@/lib/api/auth';
import { getAuthErrorMessage } from '@/lib/api/errorMessages';
import { resolvePostLoginDest } from '@/lib/resolvePostLoginDest';
import { isAxiosError } from 'axios';

interface Props {
  returnTo?: string;
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : '올바른 이메일 형식이 아닙니다.';
}

function validatePassword(v: string) {
  return v ? '' : '비밀번호를 입력해주세요.';
}

export default function LoginForm({ returnTo }: Props) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      const { account, tokens } = await login(email, password);
      setAuth(account, tokens.accessToken);
      navigate(resolvePostLoginDest(account, { returnTo }), { replace: true });
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      setServerError(getAuthErrorMessage(status));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-ink">로그인</h1>

      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="login-email" className="block text-sm font-medium text-ink-700">
          이메일
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email))}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'login-email-error' : undefined}
          placeholder="example@email.com"
          className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
        />
        {emailError && (
          <p id="login-email-error" className="text-xs text-danger">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="login-password" className="block text-sm font-medium text-ink-700">
          비밀번호
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordError(validatePassword(password))}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? 'login-password-error' : undefined}
          placeholder="비밀번호 입력"
          className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
        />
        {passwordError && (
          <p id="login-password-error" className="text-xs text-danger">
            {passwordError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
      >
        {isSubmitting ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
}
