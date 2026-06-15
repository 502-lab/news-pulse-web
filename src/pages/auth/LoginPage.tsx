import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginForm from '@/components/features/auth/LoginForm';
import SocialButtons from '@/components/features/auth/SocialButtons';

interface LocationState {
  returnTo?: string;
  message?: string;
}

export default function LoginPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const returnTo = state?.returnTo;
  const message = state?.message;

  useEffect(() => {
    // redirect로 들어온 경우에만 배너를 한 번 보여주고, history state를 지워
    // 새로고침 시 배너가 재표시되지 않도록 한다
    if (returnTo || message) {
      window.history.replaceState(null, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {returnTo && !message && (
        <div role="status" className="flex items-start gap-2.5 text-[13px] text-ink-600 bg-brand-50 border border-brand/20 rounded-btn px-3.5 py-3 mb-5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-brand" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          로그인이 필요한 페이지입니다. 로그인하면 해당 페이지로 이동합니다.
        </div>
      )}
      {message && (
        <p role="status" className="text-sm text-ok bg-ok/5 rounded-input px-3 py-2 mb-5">
          {message}
        </p>
      )}

      <h2 className="text-[24px] font-extrabold text-ink tracking-tight">로그인</h2>
      <p className="text-[13.5px] text-ink-500 mt-1.5">계정에 로그인하고 맞춤 뉴스를 받아보세요.</p>

      <LoginForm returnTo={returnTo} />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-ink-200" />
        <span className="text-[11.5px] text-ink-400 font-medium shrink-0">또는 간편 로그인</span>
        <div className="flex-1 h-px bg-ink-200" />
      </div>

      <SocialButtons />

      <p className="text-[12.5px] text-ink-400 text-center mt-7">
        계정이 없으신가요?{' '}
        <Link to="/register" className="font-semibold text-brand hover:text-brand-700 transition-colors">
          회원가입
        </Link>
      </p>

      <p className="text-[11.5px] text-ink-400 text-center mt-3 leading-relaxed pb-2">
        로그인 시{' '}
        <Link to="/terms" className="underline hover:text-ink-600 transition-colors">이용약관</Link>
        {' '}및{' '}
        <Link to="/privacy" className="underline hover:text-ink-600 transition-colors">개인정보처리방침</Link>
        에 동의합니다.
      </p>
    </div>
  );
}
