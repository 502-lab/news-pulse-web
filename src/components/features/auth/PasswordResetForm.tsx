import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { requestPasswordReset, verifyPasswordResetCode, confirmPasswordReset } from '@/lib/api/auth';

type Step = 1 | 2 | 3;

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : '올바른 이메일 형식이 아닙니다.';
}

function validateCode(v: string) {
  return /^\d{6}$/.test(v) ? '' : '6자리 숫자 코드를 입력해주세요.';
}

function validatePassword(v: string) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v)
    ? ''
    : '비밀번호는 영문·숫자를 포함해 8자 이상이어야 합니다.';
}

export default function PasswordResetForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedResetToken, setStoredResetToken] = useState('');

  async function handleStep1() {
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      await requestPasswordReset(email);
      setSuccessMessage('재설정 메일이 발송됐습니다. 이메일을 확인해주세요.');
      setStep(2);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        setServerError('잠시 후 다시 시도해주세요.');
      } else if (isAxiosError(err) && err.response?.status === 503) {
        setServerError('메일 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setServerError('오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStep2() {
    const err = validateCode(code);
    setCodeError(err);
    if (err) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      const { resetToken: token } = await verifyPasswordResetCode(email, code);
      setStoredResetToken(token);
      setSuccessMessage('');
      setStep(3);
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setCodeError('코드가 일치하지 않습니다.');
        } else if (status === 422) {
          setCodeError('코드가 만료됐습니다. 다시 발송해주세요.');
        } else {
          setServerError('오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStep3() {
    const pErr = validatePassword(newPassword);
    const cErr = newPassword === confirmPassword ? '' : '비밀번호가 일치하지 않습니다.';
    setPasswordError(pErr);
    setConfirmError(cErr);
    if (pErr || cErr) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      await confirmPasswordReset(storedResetToken, newPassword);
      navigate('/login', {
        replace: true,
        state: { message: '비밀번호가 변경됐습니다. 새 비밀번호로 로그인해주세요.' },
      });
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setServerError('재설정 세션이 만료됐습니다. 처음부터 다시 시도해주세요.');
        } else if (status === 422) {
          setPasswordError('비밀번호는 영문·숫자를 포함해 8자 이상이어야 합니다.');
        } else {
          setServerError('오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-ink">비밀번호 재설정</h1>

      {/* 단계 표시 */}
      <div className="flex items-center gap-2 text-xs text-ink-400">
        {(['이메일', '인증 코드', '새 비밀번호'] as const).map((label, i) => (
          <span
            key={label}
            className={i + 1 === step ? 'font-semibold text-brand' : ''}
          >
            {i + 1}. {label}
            {i < 2 && <span className="ml-2">›</span>}
          </span>
        ))}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
          {serverError}
        </p>
      )}

      {successMessage && (
        <p role="status" className="text-sm text-ok bg-ok/5 rounded-input px-3 py-2">
          {successMessage}
        </p>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="reset-email" className="block text-sm font-medium text-ink-700">
              이메일
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailError(validateEmail(email))}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'reset-email-error' : undefined}
              placeholder="가입한 이메일 입력"
              className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
            />
            {emailError && (
              <p id="reset-email-error" className="text-xs text-danger">{emailError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleStep1}
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
          >
            {isSubmitting ? '발송 중…' : '재설정 메일 발송'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="reset-code" className="block text-sm font-medium text-ink-700">
              인증 코드
            </label>
            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onBlur={() => setCodeError(validateCode(code))}
              aria-invalid={!!codeError}
              aria-describedby={codeError ? 'reset-code-error' : undefined}
              placeholder="이메일로 받은 6자리 코드"
              className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger tracking-widest"
            />
            {codeError && (
              <p id="reset-code-error" className="text-xs text-danger">{codeError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleStep2}
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
          >
            {isSubmitting ? '확인 중…' : '코드 확인'}
          </button>
          <button
            type="button"
            onClick={() => { setStep(1); setCode(''); setCodeError(''); setSuccessMessage(''); }}
            className="w-full text-sm text-ink-500 hover:text-brand"
          >
            다시 발송
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="reset-new-pw" className="block text-sm font-medium text-ink-700">
              새 비밀번호
            </label>
            <input
              id="reset-new-pw"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setPasswordError(validatePassword(newPassword))}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'reset-pw-error' : undefined}
              placeholder="영문·숫자 포함 8자 이상"
              className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
            />
            {passwordError && (
              <p id="reset-pw-error" className="text-xs text-danger">{passwordError}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="reset-confirm-pw" className="block text-sm font-medium text-ink-700">
              비밀번호 확인
            </label>
            <input
              id="reset-confirm-pw"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() =>
                setConfirmError(newPassword === confirmPassword ? '' : '비밀번호가 일치하지 않습니다.')
              }
              aria-invalid={!!confirmError}
              aria-describedby={confirmError ? 'reset-confirm-error' : undefined}
              placeholder="비밀번호 재입력"
              className="w-full border border-ink-200 rounded-input px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand aria-[invalid=true]:border-danger"
            />
            {confirmError && (
              <p id="reset-confirm-error" className="text-xs text-danger">{confirmError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleStep3}
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
          >
            {isSubmitting ? '변경 중…' : '비밀번호 변경'}
          </button>
        </div>
      )}
    </div>
  );
}
