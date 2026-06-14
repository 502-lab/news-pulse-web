import { Link, useLocation } from 'react-router-dom';
import LoginForm from '@/components/features/auth/LoginForm';
import SocialButtons from '@/components/features/auth/SocialButtons';

interface LocationState {
  returnTo?: string;
}

export default function LoginPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const returnTo = state?.returnTo;

  return (
    <div>
      <LoginForm returnTo={returnTo} />

      <div className="px-6 pb-4 space-y-4">
        <div className="relative flex items-center gap-3">
          <hr className="flex-1 border-ink-200" />
          <span className="text-xs text-ink-400 shrink-0">또는</span>
          <hr className="flex-1 border-ink-200" />
        </div>

        <SocialButtons />

        <p className="text-xs text-center text-ink-400">
          로그인하면{' '}
          <Link to="/terms" className="underline hover:text-ink-600">
            서비스 이용약관
          </Link>{' '}
          및{' '}
          <Link to="/privacy" className="underline hover:text-ink-600">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>

      <div className="px-6 pb-6 flex justify-between text-sm">
        <Link to="/register" className="text-brand hover:underline font-medium">
          회원가입
        </Link>
        <Link to="/forgot-password" className="text-ink-500 hover:underline">
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
}
