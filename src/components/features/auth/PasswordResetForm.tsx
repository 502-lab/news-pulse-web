import { useState, useRef, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { requestPasswordReset, verifyPasswordResetCode, confirmPasswordReset } from '@/lib/api/auth';

type Stage = 1 | 2 | 3 | 4;

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
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
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon({ size = 16, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function set(i: number, ch: string) {
    const digit = ch.replace(/[^0-9]/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    const next = arr.join('').slice(0, 6);
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const d = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 6);
    if (d) {
      onChange(d);
      refs.current[Math.min(d.length, 5)]?.focus();
    }
  }

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
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
          className={`w-full aspect-square text-center text-[20px] font-extrabold tabular-nums rounded-btn border bg-white focus:outline-none focus:ring-2 transition-all ${
            value[i] ? 'border-brand text-ink' : 'border-ink-200 text-ink-400'
          } focus:border-brand focus:ring-brand/15`}
        />
      ))}
    </div>
  );
}

function Stepper({ stage }: { stage: Stage }) {
  const labels = ['이메일', '인증 코드', '새 비밀번호'];
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const isDone = stage > n || stage === 4;
        const isCurrent = stage === n;
        return (
          <Fragment key={n}>
            <div className={`flex items-center gap-2 ${stage >= n ? '' : 'opacity-40'}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums transition-all ${
                  isDone || isCurrent ? 'bg-brand text-white' : 'bg-ink-100 text-ink-400'
                }`}
              >
                {isDone ? <CheckIcon size={12} strokeWidth={3} /> : n}
              </span>
              <span className={`text-[11.5px] font-semibold ${stage >= n ? 'text-ink-700' : 'text-ink-400'}`}>
                {label}
              </span>
            </div>
            {i < 2 && <div className={`flex-1 h-px ${stage > n ? 'bg-brand' : 'bg-ink-200'}`} />}
          </Fragment>
        );
      })}
    </div>
  );
}

function calcStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ['약함', '약함', '보통', '강함', '매우 강함'];
  const colors = ['#EF4444', '#EF4444', '#F59E0B', '#10B981', '#10B981'];
  return { score: s, label: labels[s], color: colors[s] };
}

export default function PasswordResetForm() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(0);
  const [codeErr, setCodeErr] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const strength = calcStrength(pw);
  const pwMismatch = pw2.length > 0 && pw !== pw2;
  const canReset = pw.length >= 8 && pw === pw2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function sendCode() {
    if (!emailValid) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    setIsSubmitting(true);
    setServerError('');
    try {
      await requestPasswordReset(email);
      setStage(2);
      setSecs(180);
      setCode('');
      setCodeErr('');
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

  async function verifyCode() {
    if (code.length < 6) {
      setCodeErr('6자리 인증 코드를 입력해 주세요.');
      return;
    }
    setIsSubmitting(true);
    setServerError('');
    try {
      const { resetToken: token } = await verifyPasswordResetCode(email, code);
      setResetToken(token!);
      setCodeErr('');
      setStage(3);
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setCodeErr('인증 코드가 올바르지 않습니다. 다시 확인해 주세요.');
        } else if (status === 422) {
          setCodeErr('코드가 만료됐습니다. 다시 발송해 주세요.');
        } else {
          setServerError('오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changePassword() {
    if (!canReset) return;
    setIsSubmitting(true);
    setServerError('');
    try {
      await confirmPasswordReset(resetToken, pw);
      setStage(4);
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          setServerError('재설정 세션이 만료됐습니다. 처음부터 다시 시도해주세요.');
        } else if (status === 422) {
          setServerError('비밀번호는 영문·숫자를 포함해 8자 이상이어야 합니다.');
        } else {
          setServerError('오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-brand mb-5 group transition-colors"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">
          <ArrowLeftIcon />
        </span>
        로그인으로
      </Link>

      {stage <= 3 && <Stepper stage={stage} />}

      {serverError && (
        <p role="alert" className="text-[12.5px] text-danger bg-danger/5 rounded-card px-3 py-2 mb-4">
          {serverError}
        </p>
      )}

      {/* Stage 1 — 이메일 */}
      {stage === 1 && (
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-tight">비밀번호 재설정</h1>
          <p className="text-[13.5px] text-ink-500 mt-1.5 leading-relaxed">
            가입하신 이메일로 6자리 인증 코드를 보내드려요.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <div>
              <label htmlFor="reset-email" className="block text-[12.5px] font-semibold text-ink-700 mb-1.5">
                이메일
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <MailIcon />
                </span>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  onBlur={() => { if (email && !emailValid) setEmailError('올바른 이메일 형식이 아닙니다.'); }}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'reset-email-error' : undefined}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-ink-200 rounded-btn pl-9 pr-4 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all aria-[invalid=true]:border-danger"
                />
              </div>
              {emailError && (
                <p id="reset-email-error" className="text-[12px] text-danger mt-1">{emailError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={sendCode}
              disabled={isSubmitting}
              className={`mt-1 w-full text-white text-[14px] font-bold py-2.5 rounded-btn transition-colors shadow-sm flex items-center justify-center gap-2 ${
                emailValid && !isSubmitting ? 'bg-brand hover:bg-brand-600' : 'bg-ink-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '발송 중…' : '인증 코드 받기'}
              {!isSubmitting && <MailIcon />}
            </button>
          </div>
          <div className="mt-6 flex items-start gap-2.5 text-[12px] text-ink-500 bg-ink-100/60 border border-ink-200 rounded-card p-3.5">
            <span className="text-ink-400 shrink-0 mt-0.5">
              <AlertIcon />
            </span>
            <span>소셜 계정(카카오·Google·Apple)으로 가입하셨다면, 해당 서비스에서 비밀번호를 관리합니다.</span>
          </div>
        </div>
      )}

      {/* Stage 2 — 인증 코드 */}
      {stage === 2 && (
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-tight">인증 코드 입력</h1>
          <p className="text-[13.5px] text-ink-500 mt-1.5 leading-relaxed">
            <b className="text-ink font-semibold">{email}</b>으로<br />보낸 6자리 코드를 입력해 주세요.
          </p>
          <div className="mt-7">
            <OtpInput value={code} onChange={(v) => { setCode(v); setCodeErr(''); }} />
            {codeErr && (
              <p role="alert" className="text-[12px] text-danger mt-2.5 flex items-center gap-1.5">
                <AlertIcon />{codeErr}
              </p>
            )}
            <div className="flex items-center justify-between mt-4">
              <span className="text-[12.5px] text-ink-400">
                남은 시간{' '}
                <b className={`tabular-nums font-bold ${secs > 0 ? 'text-brand' : 'text-danger'}`}>{mmss}</b>
              </span>
              <button
                type="button"
                onClick={() => { setSecs(180); setCode(''); setCodeErr(''); }}
                disabled={secs > 150}
                className={`text-[12.5px] font-semibold inline-flex items-center gap-1 ${
                  secs > 150 ? 'text-ink-300 cursor-not-allowed' : 'text-brand hover:text-brand-700'
                }`}
              >
                <RefreshIcon />코드 재전송
              </button>
            </div>
            <button
              type="button"
              onClick={verifyCode}
              disabled={isSubmitting}
              className="mt-6 w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white text-[14px] font-bold py-2.5 rounded-btn transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? '확인 중…' : '인증 확인'}
              {!isSubmitting && <ArrowRightIcon />}
            </button>
            <button
              type="button"
              onClick={() => setStage(1)}
              className="mt-3 w-full text-[12.5px] font-semibold text-ink-500 hover:text-ink-700 py-1"
            >
              이메일 주소 바꾸기
            </button>
          </div>
        </div>
      )}

      {/* Stage 3 — 새 비밀번호 */}
      {stage === 3 && (
        <div>
          <h1 className="text-[24px] font-extrabold text-ink tracking-tight">새 비밀번호 설정</h1>
          <p className="text-[13.5px] text-ink-500 mt-1.5 leading-relaxed">안전한 새 비밀번호를 입력해 주세요.</p>
          <div className="mt-7 flex flex-col gap-3">
            <div>
              <label htmlFor="reset-pw" className="block text-[12.5px] font-semibold text-ink-700 mb-1.5">
                새 비밀번호
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <LockIcon />
                </span>
                <input
                  id="reset-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="8자 이상, 영문·숫자 조합"
                  className="w-full bg-white border border-ink-200 rounded-btn pl-9 pr-10 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {pw && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ background: i < strength.score ? strength.color : '#E2E8F0' }}
                      />
                    ))}
                  </div>
                  <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="reset-pw2" className="block text-[12.5px] font-semibold text-ink-700 mb-1.5">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                  <LockIcon />
                </span>
                <input
                  id="reset-pw2"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  aria-invalid={pwMismatch}
                  aria-describedby={pwMismatch ? 'reset-pw2-error' : undefined}
                  placeholder="비밀번호 재입력"
                  className={`w-full bg-white border rounded-btn pl-9 pr-4 py-2.5 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all ${
                    pwMismatch ? 'border-danger' : 'border-ink-200'
                  }`}
                />
              </div>
              {pwMismatch && (
                <p id="reset-pw2-error" className="text-[12px] text-danger mt-1">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={changePassword}
              disabled={!canReset || isSubmitting}
              className={`mt-1 w-full text-white text-[14px] font-bold py-2.5 rounded-btn transition-colors shadow-sm flex items-center justify-center gap-2 ${
                canReset && !isSubmitting ? 'bg-brand hover:bg-brand-600' : 'bg-ink-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '변경 중…' : '비밀번호 변경하기'}
              {!isSubmitting && canReset && <CheckIcon strokeWidth={3} />}
            </button>
          </div>
        </div>
      )}

      {/* Stage 4 — 완료 */}
      {stage === 4 && (
        <div className="text-center py-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-ok/10" />
            <div className="absolute inset-0 flex items-center justify-center text-ok">
              <CheckIcon size={38} strokeWidth={2.4} />
            </div>
          </div>
          <h1 className="text-[21px] font-extrabold text-ink tracking-tight">비밀번호가 변경됐어요</h1>
          <p className="text-[13.5px] text-ink-500 mt-2.5 leading-relaxed">
            새 비밀번호로 다시 로그인해 주세요.<br />
            보안을 위해 모든 기기에서 자동 로그아웃됩니다.
          </p>
          <div className="mt-7">
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-brand hover:bg-brand-600 text-white text-[14px] font-bold py-2.5 rounded-btn transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              로그인하러 가기 <ArrowRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
