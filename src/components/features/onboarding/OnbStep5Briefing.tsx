import Icon from '@/components/ui/Icon';
import { ONB_TIMES, ONB_VOICES, type VoiceId } from '@/constants/onboarding';
import type { OnboardingAction } from '@/hooks/useOnboarding';
import type { Dispatch } from 'react';

interface OnbStep5BriefingProps {
  briefingTime: string;
  voice: VoiceId | null;
  pushAgreed: boolean;
  dispatch: Dispatch<OnboardingAction>;
}

export default function OnbStep5Briefing({
  briefingTime,
  voice,
  pushAgreed,
  dispatch,
}: OnbStep5BriefingProps) {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink-700 mb-3">
          <Icon name="clock" size={15} className="text-brand" />
          브리핑 받을 시간
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ONB_TIMES.map((t) => {
            const isOn = briefingTime === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={isOn}
                onClick={() => dispatch({ type: 'SET_TIME', value: t.value })}
                className={`flex flex-col items-center py-4 rounded-card border transition-all ${
                  isOn
                    ? 'bg-brand-50 border-brand'
                    : 'bg-white border-ink-200 hover:border-ink-300'
                }`}
              >
                <span
                  className={`text-[18px] font-extrabold tabular-nums ${isOn ? 'text-brand' : 'text-ink'}`}
                >
                  {t.value}
                </span>
                <span className="text-[12px] text-ink-400 mt-0.5">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink-700 mb-3">
          <Icon name="mic" size={15} className="text-brand" />
          AI 음성 선택
        </div>
        <div className="flex flex-col gap-2.5">
          {ONB_VOICES.map((v) => {
            const isOn = voice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={isOn}
                onClick={() =>
                  dispatch({ type: 'SET_VOICE', value: isOn ? null : v.id })
                }
                className={`flex items-center gap-3 px-3.5 py-3 rounded-card border transition-all text-left ${
                  isOn
                    ? 'bg-brand-50 border-brand'
                    : 'bg-white border-ink-200 hover:border-ink-300'
                }`}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                  style={{ background: v.color }}
                >
                  {v.av}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-ink">{v.name}</div>
                  <div className="text-[12px] text-ink-400 truncate">{v.desc}</div>
                </div>
                <span
                  aria-label="앱에서 미리듣기 가능"
                  className="w-8 h-8 rounded-full bg-white border border-ink-200 flex items-center justify-center text-ink-300 shrink-0 cursor-not-allowed"
                >
                  <Icon name="play" size={14} />
                </span>
                <span
                  className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 ${isOn ? 'border-brand' : 'border-ink-300'}`}
                >
                  {isOn && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-btn bg-brand-50 border border-brand/20">
          <span className="flex items-center gap-1.5 text-[12px] text-brand font-medium">
            <Icon name="headphones" size={13} />
            앱에서 목소리를 미리 들어보세요
          </span>
          <button
            type="button"
            disabled
            className="shrink-0 text-[11.5px] font-semibold text-brand/60 underline underline-offset-2 cursor-not-allowed"
          >
            다운로드 하러 가기 →
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={pushAgreed}
        onClick={() => dispatch({ type: 'SET_PUSH', value: !pushAgreed })}
        className="flex items-center gap-3 px-4 py-3.5 rounded-card border border-ink-200 bg-white text-left"
      >
        <span className={`w-9 h-9 rounded-btn flex items-center justify-center shrink-0 transition-colors ${pushAgreed ? 'bg-brand-50 text-brand' : 'bg-ink-100 text-ink-400'}`}>
          <Icon name="bell" size={17} />
        </span>
        <div className={`flex-1 transition-opacity ${pushAgreed ? 'opacity-100' : 'opacity-40'}`}>
          <div className="text-[13.5px] font-bold text-ink">푸시 알림 받기</div>
          <div className="text-[12px] text-ink-400">속보와 아침 브리핑을 놓치지 마세요</div>
        </div>
        <span
          role="switch"
          aria-checked={pushAgreed}
          className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${pushAgreed ? 'bg-brand' : 'bg-ink-200'}`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${pushAgreed ? 'translate-x-5' : ''}`}
          />
        </span>
      </button>

    </div>
  );
}
