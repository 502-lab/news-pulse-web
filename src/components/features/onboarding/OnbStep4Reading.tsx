import Icon from '@/components/ui/Icon';
import { ONB_DEPTHS, ONB_MODES, type ConsumeMode, type SummaryDepth } from '@/constants/onboarding';
import type { OnboardingAction } from '@/hooks/useOnboarding';
import type { Dispatch } from 'react';

interface OnbStep4ReadingProps {
  depth: SummaryDepth;
  consumeMode: ConsumeMode;
  dispatch: Dispatch<OnboardingAction>;
}

export default function OnbStep4Reading({ depth, consumeMode, dispatch }: OnbStep4ReadingProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink-700 mb-3">
          <Icon name="sparkles" size={16} className="text-brand" />
          요약 깊이
        </div>
        <div className="flex flex-col gap-2.5">
          {ONB_DEPTHS.map((o) => {
            const isOn = depth === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={isOn}
                onClick={() => dispatch({ type: 'SET_DEPTH', value: o.value })}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-card border text-left transition-all ${
                  isOn ? 'bg-brand-50 border-brand' : 'bg-white border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="flex-1">
                  <div className={`text-[14px] font-bold ${isOn ? 'text-brand' : 'text-ink'}`}>
                    {o.label}
                  </div>
                  <div className="text-[12.5px] text-ink-400 mt-0.5">{o.sub}</div>
                </div>
                <span
                  className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${isOn ? 'border-brand' : 'border-ink-300'}`}
                >
                  {isOn && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink-700 mb-3">
          <Icon name="sliders" size={15} className="text-brand" />
          주로 어떻게 보세요?
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ONB_MODES.map((m) => {
            const isOn = consumeMode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                aria-pressed={isOn}
                onClick={() => dispatch({ type: 'SET_CONSUME_MODE', value: m.value })}
                className={`flex flex-col items-center gap-2.5 py-5 rounded-card border transition-all ${
                  isOn
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-ink-200 text-ink-500 hover:border-ink-300'
                }`}
              >
                <Icon name={m.icon} size={24} />
                <span className="text-[13.5px] font-bold">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
