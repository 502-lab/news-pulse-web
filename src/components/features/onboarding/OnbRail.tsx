import Icon from '@/components/ui/Icon';
import { ONB_STEPS } from '@/constants/onboarding';

interface OnbRailProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export default function OnbRail({ currentStep }: OnbRailProps) {
  return (
    <div className="w-[260px] shrink-0 bg-navy text-white flex flex-col p-7">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-btn bg-brand flex items-center justify-center">
          <Icon name="sparkles" size={17} className="text-white" />
        </div>
        <span className="text-[16px] font-extrabold tracking-tight">Newsift</span>
      </div>
      <div className="mt-3 text-[12px] text-ink-500">맞춤 설정 · 1분이면 끝나요</div>

      <nav className="mt-8 flex flex-col gap-1" aria-label="온보딩 단계">
        {ONB_STEPS.map((st, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4 | 5;
          const isDone = currentStep > n;
          const isActive = currentStep === n;
          return (
            <div
              key={n}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn transition-colors ${isActive ? 'bg-white/10' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold tabular-nums transition-all ${
                  isDone
                    ? 'bg-brand text-white'
                    : isActive
                      ? 'bg-white text-navy'
                      : 'bg-white/10 text-ink-400'
                }`}
              >
                {isDone ? <Icon name="check" size={14} stroke={3} /> : n}
              </span>
              <div className="min-w-0">
                <div
                  className={`text-[13px] font-bold ${isDone || isActive ? 'text-white' : 'text-ink-400'}`}
                >
                  {st.label}
                </div>
                <div className="text-[11px] text-ink-500 truncate">{st.desc}</div>
              </div>
            </div>
          );
        })}
      </nav>

      <p className="mt-auto text-[11.5px] text-ink-500 leading-relaxed">
        모든 설정은 가입 후 언제든 바꿀 수 있어요.
      </p>
    </div>
  );
}
