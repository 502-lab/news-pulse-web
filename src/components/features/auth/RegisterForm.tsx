import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [consents, setConsents] = useState<ConsentInput[]>([]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: TERMS_QUERY_KEYS.activeTerms,
    queryFn: getActiveTerms,
    staleTime: 10 * 60 * 1000,
  });

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
      const { account, tokens } = await signup({
        email,
        password,
        consents,
        ageConfirmed,
      });
      setAuth(account, tokens.accessToken);
      navigate('/verify-email', { replace: true });
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
    <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-ink">회원가입</h1>

      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="reg-email" className="block text-sm font-medium text-ink-700">
          이메일
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email))}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'reg-email-error' : undefined}
          placeholder="example@email.com"
          className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
        />
        {emailError && (
          <p id="reg-email-error" className="text-xs text-danger">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-password" className="block text-sm font-medium text-ink-700">
          비밀번호
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordError(validatePassword(password))}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? 'reg-password-error' : undefined}
          placeholder="영문·숫자 포함 8자 이상"
          className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
        />
        {passwordError && (
          <p id="reg-password-error" className="text-xs text-danger">
            {passwordError}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-ink-700">
          비밀번호 확인
        </label>
        <input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setConfirmError(validateConfirm(password, confirm))}
          aria-invalid={!!confirmError}
          aria-describedby={confirmError ? 'reg-confirm-error' : undefined}
          placeholder="비밀번호 재입력"
          className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
        />
        {confirmError && (
          <p id="reg-confirm-error" className="text-xs text-danger">
            {confirmError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink-700">약관 동의</p>
        {termsLoading ? (
          <SkeletonConsentList />
        ) : (
          <ConsentList terms={terms ?? []} onChange={handleConsentChange} disabled={isSubmitting} />
        )}
        {consentError && (
          <p role="alert" className="text-xs text-danger">
            {consentError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
      >
        {isSubmitting ? '가입 중…' : '가입하기'}
      </button>
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
