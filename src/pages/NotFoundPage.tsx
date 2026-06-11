import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas">
      <p className="text-5xl font-bold text-ink">404</p>
      <p className="text-ink-400">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="text-brand hover:underline text-sm">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
