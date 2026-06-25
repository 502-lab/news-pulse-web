import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { handleSocialCallback } from '@/lib/api/auth';
import { resolvePostLoginDest } from '@/lib/resolvePostLoginDest';
import { setRefreshToken } from '@/lib/tokenStorage';
import FullPageSpinner from '@/components/common/FullPageSpinner';

type ErrorKind = 'csrf' | 'conflict' | 'generic';

export default function SocialCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [error, setError] = useState<ErrorKind | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const provider = sessionStorage.getItem('oauth_provider') as 'kakao' | 'google' | 'apple' | null;
    if (!provider) {
      navigate('/login', { replace: true });
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      sessionStorage.removeItem('oauth_provider');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('csrf');
      return;
    }

    const redirectUri = `${window.location.origin}/oauth/callback`;

    handleSocialCallback(provider, { code, state, redirectUri })
      .then((data) => {
        sessionStorage.removeItem('oauth_provider');
        if (data.isNew) {
          navigate('/social-consent', {
            state: {
              pendingToken: data.pendingToken,
              provider,
              requiredTerms: data.requiredTerms,
            },
            replace: true,
          });
        } else {
          setRefreshToken(data.tokens.refreshToken!);
          setAuth(data.account, data.tokens.accessToken!);
          navigate(resolvePostLoginDest(data.account, null), { replace: true });
        }
      })
      .catch((err) => {
        sessionStorage.removeItem('oauth_provider');
        if (isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 400) {
            setError('csrf');
          } else if (status === 409) {
            setError('conflict');
          } else {
            setError('generic');
          }
        } else {
          setError('generic');
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div role="alert" className="p-6 space-y-4 text-center">
        {error === 'csrf' && (
          <p className="text-sm text-danger">
            인증 세션이 유효하지 않습니다. 다시 시도해주세요.
          </p>
        )}
        {error === 'conflict' && (
          <p className="text-sm text-danger">
            해당 이메일로 가입된 계정이 있습니다. 이메일로 로그인해 주세요.
          </p>
        )}
        {error === 'generic' && (
          <p className="text-sm text-danger">
            소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
        )}
        <Link to="/login" replace className="text-sm text-brand hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return <FullPageSpinner />;
}
