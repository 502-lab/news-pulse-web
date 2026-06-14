import { Link } from 'react-router-dom';
import RegisterForm from '@/components/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div>
      <RegisterForm />
      <div className="px-6 pb-6 text-center text-sm text-ink-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-brand hover:underline font-medium">
          로그인
        </Link>
      </div>
    </div>
  );
}
