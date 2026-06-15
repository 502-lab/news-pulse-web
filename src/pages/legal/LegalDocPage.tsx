import { useNavigate } from 'react-router-dom';
import { type LegalDoc } from '@/constants/legalText';

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

interface Props {
  doc: LegalDoc;
}

export default function LegalDocPage({ doc }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur border-b border-ink-200 flex items-center px-6 gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-600 hover:text-brand group transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">
            <ArrowLeftIcon />
          </span>
          뒤로
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="w-6 h-6 rounded-md bg-brand text-white flex items-center justify-center">
            <StarIcon />
          </div>
          <span className="text-[14px] font-extrabold text-ink">Newsift</span>
        </div>
      </header>

      <div className="max-w-[820px] mx-auto px-6 py-12 fadeup">
        <div className="flex items-center gap-2 text-[12px] font-bold text-brand mb-3">
          <span className="bg-brand-50 px-2 py-0.5 rounded tnum">{doc.code}</span>
          <span className="uppercase tracking-wider">{doc.en}</span>
        </div>

        <h1 className="display text-[32px] font-extrabold text-ink tracking-tight">{doc.title}</h1>

        <div className="flex items-center gap-2 mt-3 text-[12.5px] text-ink-400">
          <ClockIcon />
          <span>최종 개정일 <span className="tnum">{doc.updated}</span> · 시행</span>
        </div>

        <p className="text-[14px] text-ink-600 leading-[1.8] mt-6 pb-6 border-b border-ink-200">
          {doc.intro}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 my-7 p-5 bg-white border border-ink-200 rounded-card shadow-card">
          <div className="col-span-2 text-[12px] font-bold uppercase tracking-wider text-ink-400 mb-1">
            목차 · Contents
          </div>
          {doc.sections.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px] text-ink-600 py-0.5">
              <span className="w-5 h-5 rounded bg-ink-100 text-ink-500 text-[11px] font-bold flex items-center justify-center tnum shrink-0">
                {i + 1}
              </span>
              <span className="truncate">{s.h}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8">
          {doc.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-[17px] font-extrabold text-ink flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-brand-50 text-brand text-[12px] font-bold flex items-center justify-center tnum shrink-0">
                  {i + 1}
                </span>
                {s.h}
              </h2>
              <div className="mt-3 flex flex-col gap-2.5 pl-[34px]">
                {s.body.map((p, j) => (
                  <p key={j} className="text-[13.5px] text-ink-600 leading-[1.75] flex gap-2.5">
                    <span className="text-ink-300 shrink-0 mt-px" aria-hidden="true">·</span>
                    <span>{p}</span>
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-ink-200 flex items-center justify-between">
          <span className="text-[12px] text-ink-400">© 2026 Newsift</span>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-700 transition-colors"
          >
            <ArrowLeftIcon />돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
