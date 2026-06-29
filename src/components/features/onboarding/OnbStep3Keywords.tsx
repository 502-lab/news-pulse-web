import Icon from '@/components/ui/Icon';
import { ONB_KW_GROUPS } from '@/constants/onboarding';
import type { OnboardingAction } from '@/hooks/useOnboarding';
import type { Dispatch } from 'react';

interface OnbStep3KeywordsProps {
  keywords: string[];
  dispatch: Dispatch<OnboardingAction>;
}

export default function OnbStep3Keywords({ keywords, dispatch }: OnbStep3KeywordsProps) {
  return (
    <div className="flex flex-col gap-6">
      {ONB_KW_GROUPS.map(({ group, items }) => (
        <div key={group}>
          <div className="text-[13px] font-bold text-ink-700 mb-3">{group}</div>
          <div className="flex flex-wrap gap-2">
            {items.map((it) => {
              const isOn = keywords.includes(it);
              return (
                <button
                  key={it}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => dispatch({ type: 'TOGGLE_KW', value: it })}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13.5px] font-semibold transition-all ${
                    isOn
                      ? 'bg-brand border-brand text-white'
                      : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                  }`}
                >
                  <Icon name={isOn ? 'check' : 'plus'} size={14} />
                  {it}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
