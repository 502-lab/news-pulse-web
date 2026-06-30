import { Link } from "react-router-dom";
import CatBadge from "@/components/ui/CatBadge";
import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import Icon from "@/components/ui/Icon";
import type { NewsItem } from "@/types/news";

interface NewsHomeCardProps {
  article: NewsItem;
  bookmarked: boolean;
  onOpen: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export default function NewsHomeCard({
  article,
  bookmarked,
  onOpen: _onOpen, // eslint-disable-line @typescript-eslint/no-unused-vars
  onToggleBookmark,
}: NewsHomeCardProps) {
  return (
    <div className="relative bg-white border border-ink-200 rounded-card shadow-card hover:shadow-cardhover hover:border-brand/30 transition-all group">
      {/* stretched-link: 카드 전체 클릭 영역 (북마크 버튼 아래 z-0) */}
      <Link
        to={`/articles/${article.id}`}
        className="absolute inset-0 z-0 rounded-card focus-visible:outline-2 focus-visible:outline-brand"
        aria-label={article.title}
      />

      {/* 북마크 버튼: 형제 요소, z-10으로 링크 위 */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleBookmark(article.id);
        }}
        aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
        aria-pressed={bookmarked}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-btn text-ink-300 hover:text-brand transition-colors focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Icon
          name="bookmark"
          size={16}
          className={bookmarked ? "fill-brand text-brand" : ""}
        />
      </button>

      {/* 카드 콘텐츠 (pointer-events-none: 클릭이 stretched-link로 통과) */}
      <div className="pointer-events-none p-4 flex flex-col gap-2">
        <ImgPlaceholder
          label={article.source}
          className="w-full rounded-[6px] mb-1"
          ratio="16/9"
        />
        <div className="flex items-center gap-1.5">
          <CatBadge cat={article.cat} sm />
        </div>
        <h3 className="text-[14px] font-semibold text-ink leading-snug clamp2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-[12px] text-ink-500 leading-relaxed clamp2">
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-ink-400 mt-auto pt-1 tnum">
          <span>{article.source}</span>
          <span className="text-ink-200">·</span>
          <span>{article.time}</span>
          <span className="text-ink-200">·</span>
          <span className="flex items-center gap-0.5">
            <Icon name="eye" size={11} />
            {article.reads.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
