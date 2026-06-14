import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { verifyEmail, requestEmailVerification, getMe } from '@/lib/api/auth';
import { getAuthErrorMessage } from '@/lib/api/errorMessages';
import { isAxiosError } from 'axios';

interface Props {
  email: string;
}

export default function EmailVerifyForm({ email }: Props) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  function validateCode(v: string) {
    return /^\d{6}$/.test(v) ? '' : '6자리 숫자를 입력해주세요.';
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const err = validateCode(code);
    setCodeError(err);
    if (err) return;

    setIsVerifying(true);
    setServerError('');
    try {
      await verifyEmail({ code });
      if (user && accessToken) {
        setAuth({ ...user, emailVerified: true }, accessToken);
      } else {
        // fallback: getMe()로 서버 상태 재확인
        const fresh = await getMe();
        if (accessToken) setAuth(fresh, accessToken);
      }
      navigate('/home', { replace: true });
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      if (status === 400) {
        setCodeError('인증 코드가 올바르지 않습니다.');
      } else if (status === 422) {
        setCodeError('인증 코드가 만료됐습니다. 재발송 후 다시 시도해주세요.');
      } else {
        setServerError(getAuthErrorMessage(status));
      }
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    setSuccessMessage('');
    setServerError('');
    try {
      await requestEmailVerification(email);
      setSuccessMessage('인증 메일이 재발송됐습니다.');
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      setServerError(
        status === 429 ? '잠시 후 다시 시도해주세요.' : getAuthErrorMessage(status),
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form onSubmit={handleVerify} noValidate className="p-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-ink">이메일 인증</h1>
        <p className="text-sm text-ink-500 mt-1">
          <span className="font-medium text-ink-700">{email}</span>으로 발송된 6자리 코드를
          입력해주세요.
        </p>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="text-sm text-ok bg-ok-soft rounded-input px-3 py-2">
          {successMessage}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="verify-code" className="block text-sm font-medium text-ink-700">
          인증 코드
        </label>
        <input
          id="verify-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onBlur={() => setCodeError(validateCode(code))}
          aria-invalid={!!codeError}
          aria-describedby={codeError ? 'verify-code-error' : undefined}
          placeholder="123456"
          className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink tracking-widest placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
        />
        {codeError && (
          <p id="verify-code-error" className="text-xs text-danger">
            {codeError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isVerifying}
        className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
      >
        {isVerifying ? '확인 중…' : '인증 확인'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="w-full text-sm text-ink-500 hover:text-ink-700 disabled:opacity-50 underline"
      >
        {isResending ? '발송 중…' : '인증 메일 재발송'}
      </button>
    </form>
  );
}
