import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { signup } from '@/lib/api/auth';
import { getActiveTerms, TERMS_QUERY_KEYS } from '@/lib/api/terms';
import { getAuthErrorMessage } from '@/lib/api/errorMessages';
import { isAxiosError } from 'axios';
import ConsentList from './ConsentList';
import type { components } from '../../../../generated/api-types';
import ErrorBoundary from '@/components/common/ErrorBoundary';

type ConsentInput = components['schemas']['ConsentInput'];

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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : '올바른 이메일 형식이 아닙니다.';
}

function validatePassword(v: string) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v)
    ? ''
    : '비밀번호는 영문·숫자를 포함해 8자 이상이어야 합니다.';
}

function validateConfirm(pw: string, confirm: string) {
  return pw === confirm ? '' : '비밀번호가 일치하지 않습니다.';
}

function calcStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  return s;
}

function SkeletonConsentList() {
  return (
    <div className="space-y-2.5 animate-pulse" aria-label="약관 로딩 중">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-5 bg-ink-100 rounded" />
      ))}
    </div>
  );
}

function RegisterFormInner() {
  const navigate = useNavigate();
  const setPendingToken = useAuthStore((s) => s.setPendingToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [consents, setConsents] = useState<ConsentInput[]>([]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const { data: terms, isLoading: termsLoading, isError: termsError } = useQuery({
    queryKey: TERMS_QUERY_KEYS.activeTerms,
    queryFn: getActiveTerms,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const strength = calcStrength(password);
  const strengthColor = strength === 3 ? 'bg-ok' : strength === 2 ? 'bg-warn' : 'bg-danger';
  const emailValid = !validateEmail(email) && email.length > 0;

  function handleConsentChange(c: ConsentInput[], age: boolean) {
    setConsents(c);
    setAgeConfirmed(age);
    setConsentError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirm(password, confirm);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmError(cErr);

    const requiredTerms = terms?.filter((t) => t.isRequired) ?? [];
    const allRequiredAgreed = requiredTerms.every(
      (t) => consents.find((c) => c.termsVersionId === t.id)?.agreed,
    );
    if (!allRequiredAgreed || !ageConfirmed) {
      setConsentError('필수 약관에 모두 동의해주세요.');
    }

    if (eErr || pErr || cErr || !allRequiredAgreed || !ageConfirmed) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      const { pendingToken } = await signup({ email, password, consents, ageConfirmed });
      setPendingToken(pendingToken);
      navigate('/verify-email', { replace: true, state: { from: 'register', email } });
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 409) {
        setEmailError('이미 사용 중인 이메일입니다.');
      } else {
        setServerError(getAuthErrorMessage(status));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 pt-5 pb-6 space-y-4">
      <Link
        to="/login"
        className="inline-flex items-center gap-1 text-[12.5px] text-ink-400 hover:text-brand transition-colors"
      >
        ← 로그인으로
      </Link>

      <div className="mb-1">
        <h1 className="text-[20px] font-extrabold text-ink tracking-tight">이메일로 가입하기</h1>
        <p className="text-[13px] text-ink-500 mt-1">몇 가지만 입력하면 바로 시작할 수 있어요.</p>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="reg-email" className="sr-only">이메일</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <MailIcon />
          </span>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
            onBlur={() => setEmailError(validateEmail(email))}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'reg-email-error' : undefined}
            placeholder="이메일 주소"
            className="w-full border border-ink-200 rounded-input pl-9 pr-9 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
          />
          {emailValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ok pointer-events-none">
              <CheckCircleIcon />
            </span>
          )}
        </div>
        {emailError && (
          <p id="reg-email-error" className="text-xs text-danger">{emailError}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="reg-password" className="sr-only">비밀번호</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <LockIcon />
          </span>
          <input
            id="reg-password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
            onBlur={() => setPasswordError(validatePassword(password))}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? 'reg-password-error' : 'reg-password-hint'}
            placeholder="비밀번호"
            className="w-full border border-ink-200 rounded-input pl-9 pr-9 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink"
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {password && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength && strength > 0 ? strengthColor : 'bg-ink-200'
                }`}
              />
            ))}
          </div>
        )}
        {passwordError ? (
          <p id="reg-password-error" className="text-xs text-danger">{passwordError}</p>
        ) : (
          <p id="reg-password-hint" className="text-[11.5px] text-ink-400">✓ 영문·숫자 포함 8자 이상</p>
        )}
      </div>

      {/* Confirm */}
      <div className="space-y-1">
        <label htmlFor="reg-confirm" className="sr-only">비밀번호 확인</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <LockIcon />
          </span>
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setConfirmError(''); }}
            onBlur={() => setConfirmError(validateConfirm(password, confirm))}
            aria-invalid={!!confirmError}
            aria-describedby={confirmError ? 'reg-confirm-error' : undefined}
            placeholder="비밀번호 확인"
            className="w-full border border-ink-200 rounded-input pl-9 pr-9 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink"
            aria-label={showConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
          >
            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {confirmError && (
          <p id="reg-confirm-error" className="text-xs text-danger">{confirmError}</p>
        )}
      </div>

      {/* Consent */}
      <div className="space-y-2">
        {termsLoading ? (
          <SkeletonConsentList />
        ) : termsError ? (
          <p role="alert" className="text-[12px] text-warn">
            약관을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.
          </p>
        ) : (
          <ConsentList terms={Array.isArray(terms) ? terms : []} onChange={handleConsentChange} disabled={isSubmitting} />
        )}
        {consentError && (
          <p role="alert" className="text-xs text-danger">{consentError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-bold rounded-btn py-2.5 text-[13.5px] transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? '가입 중…' : '이메일 인증하고 가입'}
        {!isSubmitting && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>

      <p className="text-center text-[12.5px] text-ink-400">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-brand hover:underline font-semibold">
          로그인
        </Link>
      </p>
    </form>
  );
}

export default function RegisterForm() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-sm text-danger" role="alert">
          오류가 발생했습니다. 새로고침 후 다시 시도해주세요.
        </div>
      }
    >
      <RegisterFormInner />
    </ErrorBoundary>
  );
}
