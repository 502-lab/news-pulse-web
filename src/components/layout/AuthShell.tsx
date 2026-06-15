import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';

function StarIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3z" />
    </svg>
  );
}

function GlobeSvg() {
  return (
    <svg
      className="absolute -right-24 -bottom-24 opacity-[0.13]"
      width="520"
      height="520"
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="260" cy="260" rx="240" ry="240" stroke="#fff" strokeWidth="1.5" />
      <ellipse cx="260" cy="260" rx="240" ry="100" stroke="#fff" strokeWidth="1.5" />
      <ellipse cx="260" cy="260" rx="100" ry="240" stroke="#fff" strokeWidth="1.5" />
      <circle cx="260" cy="20" r="7" fill="#6366F1" />
      <circle cx="500" cy="260" r="5" fill="#06B6D4" />
    </svg>
  );
}

const STATS: Array<[string, string, number]> = [
  ['1,284', '오늘 수집', 0],
  ['99.8%', '가용성', 120],
  ['8,432', '구독자', 240],
];

function StatItem({ raw, label, delay }: { raw: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isPercent = raw.endsWith('%');
  const target = parseFloat(raw.replace(/[%,]/g, ''));
  const decimals = raw.includes('.') ? (raw.split('.')[1] ?? '').replace(/%.*/, '').length : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf: number;
    const tid = setTimeout(() => {
      if (!el) return;
      let t0: number | null = null;
      el.textContent = isPercent ? `0.${'0'.repeat(decimals)}%` : '0';
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / 1200, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const cur = p < 1 ? target * eased : target;
        el.textContent = isPercent
          ? cur.toFixed(decimals) + '%'
          : Math.round(cur).toLocaleString('en-US');
        if (p < 1) raf = requestAnimationFrame(step);
        else el.textContent = raw;
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => { clearTimeout(tid); cancelAnimationFrame(raf); };
  }, [raw, target, decimals, isPercent, delay]);

  return (
    <div>
      <div ref={ref} className="display text-[24px] font-extrabold tnum min-w-[5ch]">{raw}</div>
      <div className="text-[12.5px] text-ink-400 mt-1">{label}</div>
    </div>
  );
}

export default function AuthShell() {
  return (
    <div className="h-screen w-full flex bg-canvas overflow-hidden">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex w-[46%] max-w-[640px] bg-navy text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
            <StarIcon size={19} />
          </div>
          <span className="text-[19px] font-extrabold tracking-tight">Newsift</span>
        </div>

        <div className="relative z-10">
          <p className="display text-[34px] font-extrabold leading-[1.25] tracking-tight">
            AI가 큐레이션하는<br />오늘의 뉴스 인텔리전스
          </p>
          <p className="text-[15px] text-ink-300 mt-5 leading-relaxed max-w-md">
            매일 수천 건의 기사를 수집·요약하고, 편향과 트렌드를 한눈에. 더 빠르고 균형 잡힌 뉴스 읽기를 시작하세요.
          </p>
          <div className="flex gap-8 mt-9">
            {STATS.map(([n, l, d]) => (
              <StatItem key={l} raw={n} label={l} delay={d} />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[12px] text-ink-500">
          © 2026 Newsift · 모든 뉴스는 AI로 분석됩니다
        </div>

        <GlobeSvg />
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[380px] fadein">
          {/* Mobile logo — hidden on desktop */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
              <StarIcon size={17} />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight text-ink">Newsift</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
