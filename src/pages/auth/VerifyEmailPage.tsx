import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { requestEmailVerification } from '@/lib/api/auth';
import { getAuthErrorMessage } from '@/lib/api/errorMessages';
import { isAxiosError } from 'axios';
import EmailVerifyForm from '@/components/features/auth/EmailVerifyForm';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function VerifyEmailPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();
  const state = location.state as { from?: string; email?: string } | null;

  // signup 흐름: user가 null이므로 location.state.email로 fallback
  const email = user?.email ?? state?.email ?? '';

  const sent = useRef(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (sent.current || !email) return;
    sent.current = true;
    requestEmailVerification(email).catch((err) => {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      const code = isAxiosError(err) ? (err.response?.data as { code?: string })?.code : undefined;
      if (code === 'EMAIL_DELIVERY_FAILED') {
        setSendError('이메일 발송 서비스에 일시적인 문제가 있습니다. 잠시 후 재전송을 눌러 주세요.');
      } else if (status === 401) {
        setSendError('인증 세션이 만료됐습니다. 다시 회원가입해 주세요.');
      } else {
        setSendError(getAuthErrorMessage(status));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  if (isLoading) return <FullPageSpinner />;

  return <EmailVerifyForm email={email} initialError={sendError} />;
}
