import { Link } from 'react-router-dom';
import PasswordResetForm from '@/components/features/auth/PasswordResetForm';

export default function ForgotPasswordPage() {
  return (
    <div>
      <PasswordResetForm />
      <div className="px-6 pb-6 text-center">
        <Link
          to="/login"
          className="text-sm text-ink-500 hover:text-brand"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
