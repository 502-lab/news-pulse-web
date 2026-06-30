import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ONB_HEADS } from "@/constants/onboarding";
import Icon from "@/components/ui/Icon";
import OnbRail from "@/components/features/onboarding/OnbRail";
import OnbStep1Profile from "@/components/features/onboarding/OnbStep1Profile";
import OnbStep2Topics from "@/components/features/onboarding/OnbStep2Topics";
import OnbStep3Keywords from "@/components/features/onboarding/OnbStep3Keywords";
import OnbStep4Reading from "@/components/features/onboarding/OnbStep4Reading";
import OnbStep5Briefing from "@/components/features/onboarding/OnbStep5Briefing";

const TOTAL = 5;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  // 훅은 조건부 return 전에 호출 (Rules of Hooks 준수)
  const { state, dispatch, canProceed, back, skip, submit } = useOnboarding();

  // T015: 재진입 가드 — 완료 사용자 즉시 리다이렉트 (SC-004 플래시 없음)
  if (user?.onboardingCompleted) {
    return <Navigate to="/home" replace />;
  }

  const { step, topics, keywords, submitStatus, submitError } = state;
  const [title, subtitle] = ONB_HEADS[step];
  const isLoading = submitStatus === "loading";

  async function handleNext() {
    if (step < TOTAL) {
      dispatch({ type: "NEXT" });
    } else {
      try {
        await submit();
        if (user && accessToken) {
          setAuth({ ...user, onboardingCompleted: true }, accessToken);
        }
        navigate("/home", { replace: true });
      } catch {
        // submitError는 useOnboarding reducer에서 SUBMIT_ERROR로 처리됨
      }
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div
        className="w-full max-w-[940px] bg-white border border-ink-200 rounded-2xl shadow-pop overflow-hidden flex"
        style={{ height: "min(680px, 92vh)" }}
      >
        {/* 좌측 단계 레일 */}
        <OnbRail currentStep={step} />

        {/* 우측 콘텐츠 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto px-9 py-8">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-bold text-brand tracking-wide">
                STEP {step} / {TOTAL}
              </div>
              {(step === 3 || step === 4) && (
                <button
                  type="button"
                  onClick={skip}
                  className="inline-flex items-center text-[12.5px] font-semibold text-ink-400 hover:text-ink-600 transition-colors"
                >
                  건너뛰기
                  <Icon name="chevright" size={14} />
                </button>
              )}
            </div>

            <h2 className="text-[24px] font-extrabold text-ink tracking-tight mt-2 leading-snug">
              {title}
            </h2>
            <p className="text-[13.5px] text-ink-500 mt-1.5">{subtitle}</p>

            {submitError && (
              <p
                role="alert"
                className="mt-4 text-sm text-danger bg-danger/5 rounded-btn px-4 py-2.5"
              >
                {submitError}
              </p>
            )}

            <div className="mt-7">
              {step === 1 && (
                <OnbStep1Profile
                  nick={state.nick}
                  age={state.age}
                  job={state.job}
                  dispatch={dispatch}
                />
              )}
              {step === 2 && (
                <OnbStep2Topics topics={topics} dispatch={dispatch} />
              )}
              {step === 3 && (
                <OnbStep3Keywords keywords={keywords} dispatch={dispatch} />
              )}
              {step === 4 && (
                <OnbStep4Reading
                  depth={state.depth}
                  consumeMode={state.consumeMode}
                  dispatch={dispatch}
                />
              )}
              {step === 5 && (
                <OnbStep5Briefing
                  briefingTime={state.briefingTime}
                  voice={state.voice}
                  pushAgreed={state.pushAgreed}
                  dispatch={dispatch}
                />
              )}
            </div>
          </div>

          {/* 푸터 */}
          <div className="border-t border-ink-100 px-9 py-4 flex items-center justify-between gap-4 bg-white">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className={`inline-flex items-center gap-1.5 text-[13.5px] font-bold px-4 py-2.5 rounded-btn transition-colors ${
                step === 1
                  ? "text-ink-300 cursor-not-allowed"
                  : "text-ink-600 hover:bg-ink-100"
              }`}
            >
              <Icon name="arrowleft" size={15} />
              이전
            </button>

            <div className="flex items-center gap-4">
              {step === 2 && (
                <span className="text-[12.5px] text-ink-400 font-semibold">
                  <b className="text-brand tabular-nums">{topics.length}개</b>{" "}
                  선택됨
                </span>
              )}
              {step === 3 && (
                <span className="text-[12.5px] text-ink-400 font-semibold">
                  <b className="text-brand tabular-nums">{keywords.length}개</b>{" "}
                  팔로우 중
                </span>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className={`inline-flex items-center gap-2 text-white text-[14px] font-bold px-6 py-2.5 rounded-btn shadow-sm transition-all ${
                  !canProceed || isLoading
                    ? "bg-ink-300 cursor-not-allowed"
                    : "bg-brand hover:bg-brand-600"
                }`}
              >
                {isLoading ? (
                  <>
                    <Icon name="refresh" size={16} className="animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    {step === TOTAL ? "Newsift 시작하기" : "다음"}
                    <Icon name="arrowright" size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
