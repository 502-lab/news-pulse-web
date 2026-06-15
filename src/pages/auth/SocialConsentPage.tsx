import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { completeSocialSignup } from '@/lib/api/auth';
import { resolvePostLoginDest } from '@/lib/resolvePostLoginDest';
import { setRefreshToken } from '@/lib/tokenStorage';
import ConsentList from '@/components/features/auth/ConsentList';
import type { components } from '../../../generated/api-types';

type TermsVersion = components['schemas']['TermsVersion'];
type ConsentInput = components['schemas']['ConsentInput'];

interface LocationState {
  pendingToken: string;
  provider: string;
  requiredTerms: TermsVersion[];
}

const PROVIDER_LABEL: Record<string, string> = {
  kakao: '카카오',
  google: 'Google',
  apple: 'Apple',
};

export default function SocialConsentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const state = location.state as LocationState | null;

  const [consents, setConsents] = useState<ConsentInput[]>([]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state?.pendingToken) {
      navigate('/login', { replace: true });
    }
  // Guard fires only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state?.pendingToken) return null;

  const { pendingToken, provider, requiredTerms } = state;
  const providerLabel = PROVIDER_LABEL[provider] ?? provider;

  const requiredTermIds = requiredTerms.filter((t) => t.isRequired).map((t) => t.id);
  const allRequiredAgreed =
    requiredTermIds.every((id) => consents.find((c) => c.termsVersionId === id)?.agreed) &&
    ageConfirmed;

  function handleConsentChange(next: ConsentInput[], age: boolean) {
    setConsents(next);
    setAgeConfirmed(age);
  }

  async function handleSubmit() {
    if (!allRequiredAgreed) return;
    setIsSubmitting(true);
    setError('');
    try {
      const { account, tokens } = await completeSocialSignup({
        pendingToken,
        consents,
        ageConfirmed,
      });
      setRefreshToken(tokens.refreshToken);
      setAuth(account, tokens.accessToken);
      navigate(resolvePostLoginDest(account, null), { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setError('만료되었습니다. 소셜 로그인을 다시 시도해주세요.');
      } else {
        setError('오류가 발생했습니다. 다시 시도해주세요.');
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-bold text-ink">
        {providerLabel}로 가입을 완료하려면 약관에 동의해주세요
      </h1>

      {error && (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-danger bg-danger/5 rounded-input px-3 py-2">
            {error}
          </p>
          <Link to="/login" replace className="text-sm text-brand hover:underline block">
            로그인으로 돌아가기
          </Link>
        </div>
      )}

      <ConsentList
        terms={requiredTerms}
        onChange={handleConsentChange}
        disabled={isSubmitting}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allRequiredAgreed || isSubmitting}
        className="w-full bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white font-semibold rounded-btn py-2.5 text-sm transition-colors"
      >
        {isSubmitting ? '처리 중…' : '가입 완료'}
      </button>
    </div>
  );
}
