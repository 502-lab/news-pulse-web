import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { submitOnboarding } from '@/lib/api/auth';
import type { components } from '../../../generated/api-types';

type Category = "POLITICS" | "ECONOMY_FINANCE" | "ENTERTAINMENT_CULTURE" | "SPORTS" | "WORLD" | "SCIENCE" | "HEALTH_MEDICINE" | "AUTOMOTIVE" | "IT" | "OTHER";
type OnboardingRequest = components['schemas']['OnboardingRequest'];

const STEP_LABELS = ['프로필', '관심사', '키워드', '읽는 방식', '브리핑'];
const STEP_TITLES = ['프로필을 알려주세요', '관심 분야를 선택해주세요', '팔로우할 키워드', '어떻게 읽으세요?', '브리핑 설정'];
const STEP_SUBTITLES = [
  '닉네임과 간단한 정보를 입력해주세요. 모두 선택사항이에요.',
  '최소 3가지를 선택하면 맞춤 뉴스를 추천해드려요.',
  '관심 있는 기업, 이슈, 인물을 팔로우하세요. 나중에 언제든 바꿀 수 있어요.',
  '뉴스를 어떻게 소비하시나요?',
  '매일 아침 브리핑을 받아보세요.',
];

const ONB_AGES = [
  { label: '10대', value: 'TEENS' },
  { label: '20대', value: 'TWENTIES' },
  { label: '30대', value: 'THIRTIES' },
  { label: '40대', value: 'FORTIES' },
  { label: '50대 이상', value: 'FIFTIES_PLUS' },
] as const;

const ONB_JOBS = ['직장인', '학생', '프리랜서', '창업자', '기타'];

const ONB_TOPICS: Array<{ cat: Category; label: string; emoji: string }> = [
  { cat: 'ECONOMY_FINANCE', label: '경제·금융', emoji: '📈' },
  { cat: 'IT', label: 'IT·과학', emoji: '💻' },
  { cat: 'POLITICS', label: '정치', emoji: '🏛️' },
  { cat: 'SPORTS', label: '스포츠', emoji: '🏆' },
  { cat: 'WORLD', label: '세계', emoji: '🌍' },
  { cat: 'ENTERTAINMENT_CULTURE', label: '연예·문화', emoji: '🎬' },
  { cat: 'HEALTH_MEDICINE', label: '건강·의학', emoji: '❤️' },
  { cat: 'AUTOMOTIVE', label: '자동차', emoji: '🚗' },
];

const ONB_KW_GROUPS: Array<{
  group: string;
  type: 'COMPANY' | 'THEME' | 'PERSON';
  items: string[];
}> = [
  {
    group: '기업·브랜드',
    type: 'COMPANY',
    items: ['삼성전자', 'LG전자', '현대차', 'SK하이닉스', '네이버', '카카오', '애플', '테슬라'],
  },
  {
    group: '테마·이슈',
    type: 'THEME',
    items: ['AI·인공지능', '반도체', '부동산', '금리', '환율', '주식', '기후변화', '전기차'],
  },
  {
    group: '인물',
    type: 'PERSON',
    items: ['이재명', '윤석열', '이준석', '일론 머스크', '젠슨 황'],
  },
];

const ONB_DEPTHS = [
  { label: '핵심만 빠르게', sub: '요점만 30초 안에', value: 'BRIEF' },
  { label: '균형 있게', sub: '맥락 포함 1~2분', value: 'BALANCED' },
  { label: '깊이 있게', sub: '배경·분석까지 3분+', value: 'DEEP' },
] as const;

const ONB_MODES = [
  { label: '읽기', value: 'READ' },
  { label: '듣기', value: 'LISTEN' },
  { label: '둘 다', value: 'BOTH' },
] as const;

const ONB_TIMES = [
  { label: '아침 7:30', value: '07:30' },
  { label: '점심 12:30', value: '12:30' },
  { label: '저녁 21:00', value: '21:00' },
] as const;

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState(1);
  const [nick, setNick] = useState('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [topics, setTopics] = useState<Category[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [depth, setDepth] = useState<'BRIEF' | 'BALANCED' | 'DEEP'>('BALANCED');
  const [readMode, setReadMode] = useState<'READ' | 'LISTEN' | 'BOTH'>('READ');
  const [briefTime, setBriefTime] = useState('07:30');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [pushAgreed, setPushAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const blockNext = step === 2 && topics.length < 3;

  function toggleTopic(cat: Category) {
    setTopics((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function toggleKeyword(kw: string) {
    setKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );
  }

  function buildRequest(): OnboardingRequest {
    return {
      nickname: nick || undefined,
      ageGroup: age
        ? (ONB_AGES.find((a) => a.label === age)?.value ?? undefined)
        : undefined,
      occupation: job || undefined,
      categories: topics,
      keywords:
        keywords.length > 0
          ? keywords.map((kw) => {
              const g = ONB_KW_GROUPS.find((g) => g.items.includes(kw));
              return { keyword: kw, type: g?.type ?? ('THEME' as const) };
            })
          : undefined,
      summaryDepth: depth,
      consumeMode: readMode,
      briefingTime: briefTime,
      timezoneOffset: 540,
      voiceEnabled,
      pushAgreed,
    };
  }

  async function handleFinish() {
    setIsSubmitting(true);
    setError('');
    try {
      await submitOnboarding(buildRequest());
      if (user && accessToken) {
        setAuth({ ...user, onboardingCompleted: true }, accessToken);
      }
      navigate('/home', { replace: true });
    } catch {
      setError('설정 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (step < 5) setStep((s) => s + 1);
    else handleFinish();
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left rail */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-navy flex-col px-6 py-10 gap-8">
        <div>
          <span className="text-white font-extrabold text-[18px] tracking-tight">Newsift</span>
          <p className="text-white/50 text-[12.5px] mt-1">맞춤 설정 · 1분이면 끝나요</p>
        </div>
        <nav className="flex flex-col gap-4">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const isDone = s < step;
            const isCurrent = s === step;
            return (
              <div key={s} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-colors ${
                    isDone
                      ? 'bg-brand text-white'
                      : isCurrent
                      ? 'bg-white text-navy'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {isDone ? <CheckIcon /> : s}
                </span>
                <span
                  className={`text-[14px] font-medium transition-colors ${
                    isDone
                      ? 'text-white/60'
                      : isCurrent
                      ? 'text-white'
                      : 'text-white/30'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </nav>
        <p className="mt-auto text-white/30 text-[11.5px] leading-relaxed">
          모든 설정은 가입 후 언제든 바꿀 수 있어요.
        </p>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-14 lg:py-10">
          <p className="text-[11.5px] font-bold text-brand uppercase tracking-widest mb-3">
            STEP {step} / 5
          </p>
          <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-1">
            {STEP_TITLES[step - 1]}
          </h2>
          <p className="text-[13.5px] text-ink-500 mb-8">{STEP_SUBTITLES[step - 1]}</p>

          {error && (
            <p role="alert" className="mb-6 text-sm text-danger bg-danger/5 rounded-btn px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-7 max-w-md">
              <div className="space-y-1.5">
                <label htmlFor="onb-nick" className="block text-[13px] font-semibold text-ink-700">
                  닉네임 <span className="text-ink-400 font-normal">(선택)</span>
                </label>
                <div className="relative">
                  <input
                    id="onb-nick"
                    type="text"
                    maxLength={12}
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    placeholder="최대 12자"
                    className="w-full border border-ink-200 rounded-input px-3 py-2.5 pr-14 text-[13.5px] text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] text-ink-400 tabular-nums">
                    {nick.length}/12
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-ink-700">
                  연령대 <span className="text-ink-400 font-normal">(선택)</span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ONB_AGES.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAge(age === a.label ? '' : a.label)}
                      className={`py-2.5 rounded-btn text-[13px] font-semibold border transition-colors ${
                        age === a.label
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-ink-700 border-ink-200 hover:border-brand hover:text-brand'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-ink-700">
                  직업 <span className="text-ink-400 font-normal">(선택)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {ONB_JOBS.map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJob(job === j ? '' : j)}
                      className={`px-4 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors ${
                        job === j
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              {ONB_TOPICS.map((t) => {
                const selected = topics.includes(t.cat);
                return (
                  <button
                    key={t.cat}
                    type="button"
                    onClick={() => toggleTopic(t.cat)}
                    aria-pressed={selected}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-card border transition-all ${
                      selected
                        ? 'bg-brand border-brand text-white shadow-card'
                        : 'bg-white border-ink-200 text-ink-700 hover:border-brand hover:text-brand'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 text-white/80">
                        <CheckIcon />
                      </span>
                    )}
                    <span className="text-[28px]" aria-hidden="true">{t.emoji}</span>
                    <span className="text-[12.5px] font-bold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Keywords */}
          {step === 3 && (
            <div className="space-y-7 max-w-xl">
              {ONB_KW_GROUPS.map((g) => (
                <div key={g.group} className="space-y-2">
                  <p className="text-[12px] font-bold text-ink-500 uppercase tracking-wider">
                    {g.group}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((kw) => {
                      const active = keywords.includes(kw);
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => toggleKeyword(kw)}
                          aria-pressed={active}
                          className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors ${
                            active
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand'
                          }`}
                        >
                          {active && '# '}{kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Reading preference */}
          {step === 4 && (
            <div className="space-y-7 max-w-md">
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-ink-700">요약 깊이</p>
                <div className="flex flex-col gap-2">
                  {ONB_DEPTHS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDepth(d.value)}
                      aria-pressed={depth === d.value}
                      className={`flex items-center gap-4 px-4 py-3 rounded-btn border text-left transition-colors ${
                        depth === d.value
                          ? 'bg-brand-50 border-brand text-brand'
                          : 'bg-white border-ink-200 text-ink-700 hover:border-brand'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        depth === d.value ? 'border-brand' : 'border-ink-300'
                      }`}>
                        {depth === d.value && <span className="w-2 h-2 rounded-full bg-brand" />}
                      </span>
                      <span>
                        <span className="block text-[13.5px] font-bold">{d.label}</span>
                        <span className="block text-[12px] text-ink-400">{d.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-ink-700">소비 방식</p>
                <div className="flex gap-2">
                  {ONB_MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setReadMode(m.value)}
                      aria-pressed={readMode === m.value}
                      className={`flex-1 py-2.5 rounded-btn text-[13px] font-semibold border transition-colors ${
                        readMode === m.value
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white text-ink-700 border-ink-200 hover:border-brand hover:text-brand'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Briefing */}
          {step === 5 && (
            <div className="space-y-7 max-w-md">
              {/* 음성 브리핑 토글 + 브리핑 시간 묶음 — 단일 space-y-7 슬롯 */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-700">AI 음성 브리핑</p>
                    <p className="text-[12px] text-ink-400 mt-0.5">
                      AWS 음성 합성(TTS)으로 오늘의 뉴스를 읽어드려요
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={voiceEnabled}
                    onClick={() => setVoiceEnabled((v) => !v)}
                    className={`relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 ${
                      voiceEnabled ? 'bg-brand' : 'bg-ink-300'
                    }`}
                  >
                    <span
                      className={`inline-block w-5 h-5 rounded-full bg-white shadow mt-0.5 transition-transform ${
                        voiceEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                    <span className="sr-only">AI 음성 브리핑 {voiceEnabled ? '켜기' : '끄기'}</span>
                  </button>
                </div>

                {/* 브리핑 시간: overflow-hidden 안에 margin을 두어 접힐 때 여백도 함께 사라짐 */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    voiceEnabled ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="mt-4 space-y-2">
                      <p className="text-[13px] font-semibold text-ink-700">브리핑 시간</p>
                      <div className="flex gap-2">
                        {ONB_TIMES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setBriefTime(t.value)}
                            aria-pressed={briefTime === t.value}
                            className={`flex-1 py-2.5 rounded-btn text-[12.5px] font-semibold border transition-colors ${
                              briefTime === t.value
                                ? 'bg-brand text-white border-brand'
                                : 'bg-white text-ink-700 border-ink-200 hover:border-brand hover:text-brand'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pushAgreed}
                  onChange={(e) => setPushAgreed(e.target.checked)}
                  className="w-4 h-4 accent-brand"
                />
                <span className="text-[13px] text-ink-700 font-medium">
                  푸시 알림으로 브리핑 받기
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-ink-200 bg-white px-6 py-4 lg:px-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1 || isSubmitting}
            className="px-4 py-2 text-[13px] font-semibold text-ink-500 hover:text-ink disabled:opacity-30 transition-colors"
          >
            ← 이전
          </button>

          <div className="flex items-center gap-4">
            {step === 2 && (
              <span className="text-[12.5px] text-ink-400">
                {topics.length}개 선택됨 (최소 3개)
              </span>
            )}
            {step === 3 && keywords.length > 0 && (
              <span className="text-[12.5px] text-ink-400">
                {keywords.length}개 팔로우 중
              </span>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={blockNext || isSubmitting}
              className="px-6 py-2 bg-brand hover:bg-brand-600 disabled:bg-ink-300 text-white text-[13.5px] font-bold rounded-btn transition-colors"
            >
              {isSubmitting
                ? '저장 중…'
                : step === 5
                ? 'Newsift 시작하기 →'
                : '다음 →'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
