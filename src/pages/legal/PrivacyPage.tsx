import { Link } from 'react-router-dom';
import { legalText } from '@/constants/legalText';

export default function PrivacyPage() {
  return (
    <div className="p-6 space-y-4" aria-label="개인정보처리방침">
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm text-ink-500 hover:text-brand">
          ← 뒤로
        </Link>
        <h1 className="text-lg font-bold text-ink">개인정보처리방침</h1>
      </div>
      <div
        className="overflow-y-auto max-h-[520px] text-sm text-ink-600 leading-relaxed whitespace-pre-wrap rounded-input border border-ink-200 p-4 bg-canvas"
        tabIndex={0}
        aria-label="개인정보처리방침 본문"
      >
        {legalText.PRIVACY}
      </div>
    </div>
  );
}
