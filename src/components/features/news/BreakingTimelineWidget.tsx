import { Card } from '@/components/ui/Card';
import CatBadge from '@/components/ui/CatBadge';
import { CAT_COLOR, CAT_FALLBACK } from '@/constants/categories';
import type { NewsItem } from '@/types/news';

interface BreakingTimelineWidgetProps {
  items: NewsItem[];
  onOpen: (id: string) => void;
}

export default function BreakingTimelineWidget({
  items,
  onOpen,
}: BreakingTimelineWidgetProps) {
  return (
    <Card pad={false}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">속보 타임라인</h3>
        <span className="text-[11px] text-ink-400">최근 {items.length}건</span>
      </div>
      <div className="px-5 py-3">
        <div className="relative flex flex-col gap-3.5">
          {/* 수직 연결선 — 절대위치로 전체 관통 */}
          <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-ink-200" aria-hidden="true" />
          {items.map((item, idx) => {
            const dot = (CAT_COLOR[item.cat] ?? CAT_FALLBACK).dot;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen(item.id)}
                className="group relative flex gap-3 text-left hover:bg-ink-50 -mx-2 px-2 py-1 rounded-md transition-colors"
              >
                <span
                  className="shrink-0 mt-1 w-[11px] h-[11px] rounded-full border-2 border-white z-10"
                  style={{
                    background: dot,
                    boxShadow: `rgb(226,232,240) 0px 0px 0px 1px`,
                  }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[11.5px] font-bold tnum"
                      style={{ color: idx === 0 ? dot : '#64748B' }}
                    >
                      {item.time}
                    </span>
                    <CatBadge cat={item.cat} sm />
                  </div>
                  <p className="text-[13px] font-semibold text-ink-700 leading-snug clamp2 mt-1 group-hover:text-brand transition-colors">
                    {item.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
