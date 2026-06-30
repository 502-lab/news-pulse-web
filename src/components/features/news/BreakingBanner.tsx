import Icon from "@/components/ui/Icon";
import type { NewsItem } from "@/types/news";

interface BreakingBannerProps {
  article: NewsItem;
  onOpen: (id: string) => void;
}

export default function BreakingBanner({
  article,
  onOpen,
}: BreakingBannerProps) {
  return (
    <div className="flex items-center gap-4 bg-navy-800 rounded-card px-5 py-4">
      <span className="inline-flex items-center gap-1.5 shrink-0">
        <span
          className="w-2 h-2 rounded-full bg-danger shrink-0"
          aria-hidden="true"
        />
        <span className="text-[12px] font-bold text-white/90 tracking-wide">
          속보
        </span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white leading-snug clamp2">
          {article.title}
        </p>
        <p className="text-[12px] text-white/50 mt-0.5">
          {article.source} · {article.time}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onOpen(article.id)}
        className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white border border-white/30 hover:bg-white hover:text-navy-800 transition-colors px-4 py-2 rounded-btn focus-visible:outline-2 focus-visible:outline-white"
        aria-label={`속보 바로 읽기: ${article.title}`}
      >
        바로 읽기
        <Icon name="arrowright" size={14} />
      </button>
    </div>
  );
}
