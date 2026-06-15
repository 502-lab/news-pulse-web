import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { login } from '@/lib/api/auth';
import { setRefreshToken } from '@/lib/tokenStorage';
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

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function LoginForm({ returnTo }: Props) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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
      setRefreshToken(tokens.refreshToken!);
      setAuth(account, tokens.accessToken!);
      navigate(resolvePostLoginDest(account, { returnTo }), { replace: true });
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      setServerError(getAuthErrorMessage(status));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-3">
      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Email */}
      <div>
        <label htmlFor="login-email" className="block text-[12.5px] font-semibold text-ink-700 mb-1.5">
          이메일
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <MailIcon />
          </span>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailError(validateEmail(email))}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'login-email-error' : undefined}
            placeholder="you@example.com"
            className="w-full bg-white border border-ink-200 rounded-btn pl-9 pr-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all aria-[invalid=true]:border-danger"
          />
        </div>
        {emailError && (
          <p id="login-email-error" className="text-[11.5px] text-danger mt-1">{emailError}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="login-password" className="text-[12.5px] font-semibold text-ink-700">
            비밀번호
          </label>
          <Link to="/forgot-password" className="text-[12px] font-medium text-brand hover:text-brand-700 transition-colors">
            비밀번호 찾기
          </Link>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <LockIcon />
          </span>
          <input
            id="login-password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordError(validatePassword(password))}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? 'login-password-error' : undefined}
            placeholder="••••••••"
            className="w-full bg-white border border-ink-200 rounded-btn pl-9 pr-10 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all aria-[invalid=true]:border-danger"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 p-1 transition-colors"
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
        {passwordError && (
          <p id="login-password-error" className="text-[11.5px] text-danger mt-1">{passwordError}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white text-[14px] font-bold py-2.5 rounded-btn transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {isSubmitting ? '로그인 중…' : <><span>로그인</span><ArrowRightIcon /></>}
      </button>
    </form>
  );
}
