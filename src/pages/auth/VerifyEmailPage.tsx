import { useAuthStore } from '@/stores/authStore';
import EmailVerifyForm from '@/components/features/auth/EmailVerifyForm';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function VerifyEmailPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <FullPageSpinner />;

  return (
    <div>
      <EmailVerifyForm email={user?.email ?? ''} />
    </div>
  );
}
