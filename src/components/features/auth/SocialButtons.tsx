interface Props {
  disabled?: boolean;
}

// TODO: US3 Phase에서 getSocialAuthorizeUrl() 연결

export default function SocialButtons({ disabled = false }: Props) {
  return (
    <div className="space-y-2.5">
      <button
        type="button"
        disabled={disabled || true}
        className="w-full flex items-center justify-center gap-2.5 border border-ink-200 rounded-btn py-2.5 text-sm text-ink-700 font-medium bg-[#FEE500] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="카카오로 계속하기"
      >
        <span aria-hidden="true" className="font-bold">K</span>
        카카오로 계속하기
      </button>

      <button
        type="button"
        disabled={disabled || true}
        className="w-full flex items-center justify-center gap-2.5 border border-ink-200 rounded-btn py-2.5 text-sm text-ink-700 font-medium bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Google로 계속하기"
      >
        <span aria-hidden="true" className="font-bold text-[#4285F4]">G</span>
        Google로 계속하기
      </button>

      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-2.5 border border-ink-200 rounded-btn py-2.5 text-sm text-ink-700 font-medium bg-white opacity-50 cursor-not-allowed"
        aria-label="Apple로 계속하기 (준비 중)"
        aria-disabled="true"
      >
        <span aria-hidden="true">🍎</span>
        Apple로 계속하기
        {/* TODO(#B-3-001): Apple form_post relay 백엔드 미구현 */}
      </button>
    </div>
  );
}
