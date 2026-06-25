import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { verifyEmail, requestEmailVerification } from '@/lib/api/auth';
import { setRefreshToken } from '@/lib/tokenStorage';
import { getAuthErrorMessage } from '@/lib/api/errorMessages';
import { isAxiosError } from 'axios';

interface Props {
  email: string;
  initialError?: string;
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function set(i: number, ch: string) {
    const digit = ch.replace(/[^0-9]/g, '').slice(-1);
    const arr = value.padEnd(6, '').split('');
    arr[i] = digit;
    const next = arr.join('').slice(0, 6).replace(/\s/g, '');
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(digits);
    const nextBox = Math.min(digits.length, 5);
    refs.current[nextBox]?.focus();
  }

  return (
    <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          aria-label={`인증 코드 ${i + 1}번째 자리`}
          className={`w-full h-14 text-center text-[22px] font-extrabold tabular-nums rounded-btn border bg-white focus:outline-none focus:ring-2 transition-all ${
            value[i]
              ? 'border-brand text-ink focus:ring-brand/15'
              : 'border-ink-200 text-ink-400 focus:border-brand focus:ring-brand/15'
          }`}
        />
      ))}
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function EmailVerifyForm({ email, initialError = '' }: Props) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const navigate = useNavigate();
  const location = useLocation();
  const fromRegister = (location.state as { from?: string } | null)?.from === 'register';

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [serverError, setServerError] = useState(initialError);
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secs, setSecs] = useState(180);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialError) setServerError(initialError);
  }, [initialError]);

  useEffect(() => {
    if (secs <= 0) return;
    const id = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secs]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setCodeError('6자리 숫자를 입력해주세요.');
      return;
    }
    setCodeError('');
    setIsVerifying(true);
    setServerError('');
    try {
      const { account, tokens } = await verifyEmail({ code });
      setRefreshToken(tokens.refreshToken!);
      setAuth(account, tokens.accessToken!);
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
      setSecs(180);
      setCode('');
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
    <form onSubmit={handleVerify} noValidate className="px-6 pt-5 pb-6 space-y-5">
      {fromRegister && (
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-1 text-[12.5px] text-ink-400 hover:text-brand transition-colors"
        >
          ← 가입 정보로
        </button>
      )}

      {/* 아이콘 */}
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand">
        <MailIcon />
      </div>

      {/* 제목 + 설명 */}
      <div className="space-y-1.5">
        <h1 className="text-[20px] font-extrabold text-ink tracking-tight">이메일 인증</h1>
        <p className="text-[13.5px] text-ink-600 leading-relaxed">
          <span className="font-bold text-ink">{email}</span>으로<br />
          보낸 6자리 코드를 입력해 주세요.
        </p>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="text-sm text-ok bg-ok/10 rounded-input px-3 py-2">
          {successMessage}
        </p>
      )}

      <OtpInput value={code} onChange={(v) => { setCode(v); setCodeError(''); }} />

      {codeError && (
        <p className="text-xs text-danger">{codeError}</p>
      )}

      {/* 타이머 + 재전송 */}
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="text-ink-400">
          남은 시간{' '}
          <span className={`font-bold tabular-nums ${secs <= 30 ? 'text-danger' : 'text-brand'}`}>
            {fmt(secs)}
          </span>
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="inline-flex items-center gap-1 text-ink-400 hover:text-brand disabled:opacity-50 font-medium transition-colors"
        >
          <RefreshIcon />
          {isResending ? '발송 중…' : '코드 재전송'}
        </button>
      </div>

      <button
        type="submit"
        disabled={isVerifying || code.length !== 6}
        className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-bold rounded-btn py-2.5 text-[13.5px] transition-colors flex items-center justify-center gap-2"
      >
        {isVerifying ? '확인 중…' : (
          <>
            인증하고 가입 완료
            <CheckIcon />
          </>
        )}
      </button>

      <p className="text-center text-[11.5px] text-ink-400 leading-relaxed">
        메일이 오지 않았다면 스팸함을 확인하거나<br />
        잠시 후 코드 재전송을 눌러 주세요.
      </p>
    </form>
  );
}
