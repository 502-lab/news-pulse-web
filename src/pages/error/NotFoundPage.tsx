import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  function handleHome() {
    if (user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* Brandmark */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#6366F1" />
            <path
              d="M8 10h10M8 16h6M8 22h8"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="22"
              cy="20"
              r="5"
              fill="white"
              fillOpacity="0.25"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M25.5 23.5L28 26"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[18px] font-extrabold text-ink tracking-tight">
            Newsift
          </span>
        </div>

        {/* 404 */}
        <p className="text-[88px] font-extrabold text-brand leading-none tabular-nums">
          404
        </p>

        <h1 className="mt-4 text-[21px] font-extrabold text-ink tracking-tight">
          페이지를 찾을 수 없어요
        </h1>
        <p className="mt-2.5 text-[13.5px] text-ink-500 leading-relaxed">
          요청하신 주소가 존재하지 않거나 이동되었어요.
          <br />
          URL을 다시 확인하거나 홈으로 돌아가 주세요.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleHome}
            className="w-full bg-brand hover:bg-brand-600 text-white text-[14px] font-bold py-2.5 rounded-btn transition-colors shadow-sm"
          >
            홈으로 가기
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full bg-white hover:bg-ink-100 text-ink-600 text-[14px] font-semibold py-2.5 rounded-btn border border-ink-200 transition-colors"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
