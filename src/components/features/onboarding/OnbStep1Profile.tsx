import { useState } from 'react';
import { ONB_AGES, ONB_JOBS } from '@/constants/onboarding';
import type { OnboardingAction } from '@/hooks/useOnboarding';
import type { Dispatch } from 'react';

interface OnbStep1ProfileProps {
  nick: string;
  age: string;
  job: string;
  dispatch: Dispatch<OnboardingAction>;
}

export default function OnbStep1Profile({ nick, age, job, dispatch }: OnbStep1ProfileProps) {
  const [nickTouched, setNickTouched] = useState(false);
  const nickError = nickTouched && nick.trim().length === 0;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <label htmlFor="onb-nick" className="block text-[13px] font-bold text-ink-700 mb-2.5">
          닉네임 <span className="text-danger text-[12px]">*</span>
        </label>
        <div className="relative">
          <input
            id="onb-nick"
            type="text"
            maxLength={12}
            value={nick}
            onChange={(e) => dispatch({ type: 'SET_NICK', value: e.target.value.slice(0, 12) })}
            onBlur={() => setNickTouched(true)}
            placeholder="최대 12자"
            aria-invalid={nickError}
            aria-describedby={nickError ? 'onb-nick-error' : undefined}
            className={`w-full bg-white border-2 rounded-btn px-4 py-3 pr-16 text-[15px] font-semibold text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-colors ${
              nickError
                ? 'border-danger focus:ring-danger/15'
                : 'border-brand focus:ring-brand/15'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-ink-400 tabular-nums">
            {nick.length} / 12
          </span>
        </div>
        {nickError && (
          <p id="onb-nick-error" role="alert" className="mt-1.5 text-[12px] text-danger font-medium">
            닉네임을 입력해주세요
          </p>
        )}
      </div>

      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2.5">
          연령대 <span className="font-medium text-ink-400">· 맞춤 추천에 활용돼요</span>
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {ONB_AGES.map((a) => {
            const isOn = age === a.label;
            return (
              <button
                key={a.label}
                type="button"
                aria-pressed={isOn}
                onClick={() => dispatch({ type: 'SET_AGE', value: a.label })}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-btn border text-[14px] font-bold transition-all ${
                  isOn
                    ? 'bg-brand-50 border-brand text-brand'
                    : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${isOn ? 'border-brand' : 'border-ink-300'}`}
                >
                  {isOn && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-bold text-ink-700 mb-2.5">
          하는 일 <span className="font-medium text-ink-400">· 더 정확한 분야 추천에 활용돼요</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {ONB_JOBS.map((j) => {
            const isOn = job === j;
            return (
              <button
                key={j}
                type="button"
                aria-pressed={isOn}
                onClick={() => dispatch({ type: 'SET_JOB', value: j })}
                className={`px-3.5 py-2 rounded-full border text-[13.5px] font-semibold transition-all ${
                  isOn
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                }`}
              >
                {j}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
