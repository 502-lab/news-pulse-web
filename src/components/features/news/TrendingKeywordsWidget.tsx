import { Card, CardHead } from "@/components/ui/Card";
import type { TrendingKeyword } from "@/mocks/newsHome.mock";

interface TrendingKeywordsWidgetProps {
  keywords: TrendingKeyword[];
  onPick: (keyword: string) => void;
}

function DeltaLabel({ delta }: { delta: number }) {
  if (delta > 0)
    return (
      <span className="w-12 text-right text-[12px] tnum font-semibold text-ok shrink-0">
        ▲{delta.toLocaleString()}
      </span>
    );
  if (delta < 0)
    return (
      <span className="w-12 text-right text-[12px] tnum font-semibold text-danger shrink-0">
        ▼{Math.abs(delta).toLocaleString()}
      </span>
    );
  return (
    <span className="w-12 text-right text-[12px] tnum font-semibold text-ink-300 shrink-0">
      —
    </span>
  );
}

export default function TrendingKeywordsWidget({
  keywords,
  onPick,
}: TrendingKeywordsWidgetProps) {
  const maxCount = Math.max(...keywords.map((k) => k.count));

  return (
    <Card>
      <CardHead
        title="지금 뜨는 키워드"
        sub="실시간 Top 5"
        right={
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            LIVE
          </span>
        }
      />
      <div className="flex flex-col">
        {keywords.map((kw) => {
          const pct = Math.round((kw.count / maxCount) * 100);
          const isTop = kw.rank <= 3;
          return (
            <button
              key={kw.rank}
              type="button"
              onClick={() => onPick(kw.keyword)}
              className="group flex items-center gap-3 py-2 border-b border-ink-100 last:border-0 hover:bg-ink-50 -mx-2 px-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-brand text-left"
            >
              <span
                className={[
                  "w-6 text-center text-[13px] font-bold tnum shrink-0",
                  isTop ? "text-brand" : "text-ink-400",
                ].join(" ")}
              >
                {kw.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13.5px] font-semibold text-ink truncate min-w-0 flex-1 group-hover:text-brand transition-colors">
                    {kw.keyword}
                  </span>
                  <span className="text-[12px] tnum text-ink-400 shrink-0">
                    {kw.count.toLocaleString()}
                  </span>
                </div>
                {/* progress bar: inline style 예외 (연속값 — research.md R-04) */}
                <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={[
                      "h-full rounded-full transition-all duration-500",
                      isTop ? "bg-brand" : "bg-ink-400",
                    ].join(" ")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <DeltaLabel delta={kw.delta} />
            </button>
          );
        })}
      </div>
    </Card>
  );
}
