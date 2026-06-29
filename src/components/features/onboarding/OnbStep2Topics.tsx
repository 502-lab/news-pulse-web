import Icon from '@/components/ui/Icon';
import { ONB_TOPICS, type Category } from '@/constants/onboarding';
import type { OnboardingAction } from '@/hooks/useOnboarding';
import type { Dispatch } from 'react';

interface OnbStep2TopicsProps {
  topics: Category[];
  dispatch: Dispatch<OnboardingAction>;
}

export default function OnbStep2Topics({ topics, dispatch }: OnbStep2TopicsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ONB_TOPICS.map((t) => {
        const isOn = topics.includes(t.cat);
        return (
          <button
            key={t.cat}
            type="button"
            aria-pressed={isOn}
            onClick={() => dispatch({ type: 'TOGGLE_TOPIC', value: t.cat })}
            className={`relative h-28 rounded-card border p-4 flex flex-col justify-between text-left transition-all ${
              isOn
                ? 'bg-brand border-brand shadow-cardhover'
                : 'bg-white border-ink-200 hover:border-ink-300'
            }`}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={
                isOn
                  ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                  : { background: t.color + '1A', color: t.color }
              }
            >
              <Icon name={t.icon} size={20} />
            </span>
            <span className={`text-[14px] font-bold ${isOn ? 'text-white' : 'text-ink'}`}>
              {t.label}
            </span>
            {isOn && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <Icon name="check" size={13} className="text-brand" stroke={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
