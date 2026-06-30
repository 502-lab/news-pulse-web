import { getSocialAuthorizeUrl } from "@/lib/api/auth";

type SocialProvider = "kakao" | "google";

async function handleSocialClick(provider: SocialProvider) {
  const redirectUri = `${window.location.origin}/oauth/callback`;
  sessionStorage.setItem("oauth_provider", provider);
  const { authorizeUrl } = await getSocialAuthorizeUrl(provider, redirectUri);
  window.location.href = authorizeUrl!;
}

function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4C7 4 3 7.1 3 10.9c0 2.4 1.7 4.5 4.2 5.7-.2.6-.7 2.3-.8 2.7 0 .2.1.4.3.2.3-.2 2.6-1.8 3.5-2.4.6.1 1.2.1 1.8.1 5 0 9-3.1 9-6.9S17 4 12 4z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.6-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6C4.7 19.8 8.1 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3.1A10 10 0 002 12c0 1.6.4 3.1 1.1 4.4l3.3-2.6z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3.1 7.6l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.3 0-.1-2.1-.8-2.1-3.2zM14.3 6.3c.6-.7 1-1.7.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z" />
    </svg>
  );
}

export default function SocialButtons() {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => handleSocialClick("kakao")}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-btn text-[13.5px] font-semibold bg-[#FEE500] text-[#3C1E1E] hover:brightness-95 border border-transparent transition-all"
        aria-label="카카오로 계속하기"
      >
        <KakaoIcon /> 카카오로 계속하기
      </button>

      <button
        type="button"
        onClick={() => handleSocialClick("google")}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-btn text-[13.5px] font-semibold bg-white text-ink-700 hover:bg-ink-50 border border-ink-200 transition-all"
        aria-label="Google로 계속하기"
      >
        <GoogleIcon /> Google로 계속하기
      </button>

      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label="Apple로 계속하기 (준비 중)"
        className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-btn text-[13.5px] font-semibold bg-[#111] text-white border border-transparent opacity-60 cursor-not-allowed transition-all"
      >
        <AppleIcon /> Apple로 계속하기
        {/* TODO(#17): Apple form_post relay 백엔드 미구현 (B-3-001) */}
      </button>
    </div>
  );
}
