import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  NEWS_HOME,
  TRENDING_KEYWORDS,
  AI_BRIEFING,
} from "@/mocks/newsHome.mock";
import { HOME_CATEGORY_FILTERS } from "@/constants/categories";
import { showToast } from "@/components/ui";
import { useBookmarks } from "@/hooks/useBookmarks";
import BreakingBanner from "@/components/features/news/BreakingBanner";
import CategoryFilter from "@/components/features/news/CategoryFilter";
import NewsHomeGrid from "@/components/features/news/NewsHomeGrid";
import TrendingKeywordsWidget from "@/components/features/news/TrendingKeywordsWidget";
import BreakingTimelineWidget from "@/components/features/news/BreakingTimelineWidget";
import AIBriefingWidget from "@/components/features/news/AIBriefingWidget";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const { bookmarks: bookmarkedIds, toggle } = useBookmarks();

  const breakingArticle = NEWS_HOME.find((a) => a.isBreaking) ?? NEWS_HOME[0];

  const filteredArticles = useMemo(
    () =>
      activeCategory === "전체"
        ? NEWS_HOME
        : NEWS_HOME.filter((a) => a.cat === activeCategory),
    [activeCategory],
  );

  function toggleBookmark(id: string): void {
    const nowBookmarked = !bookmarkedIds.has(id);
    toggle(id);
    showToast(nowBookmarked ? "북마크에 저장했어요" : "북마크를 해제했어요", {
      icon: "🔖",
      tone: "ok",
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 xl:px-8 py-6">
        {/* US1: 속보 배너 */}
        <BreakingBanner
          article={breakingArticle}
          onOpen={(id) => navigate(`/articles/${id}`)}
        />

        {/* 본문 + 위젯 2단 레이아웃 */}
        <div className="flex flex-col xl:grid xl:grid-cols-12 xl:gap-6 mt-6 gap-6">
          {/* US2: 카테고리 필터 + 카드 그리드 */}
          <main className="xl:col-span-8 min-w-0">
            <CategoryFilter
              categories={HOME_CATEGORY_FILTERS}
              active={activeCategory}
              onChange={setActiveCategory}
              resultCount={filteredArticles.length}
            />
            <div className="mt-4">
              <NewsHomeGrid
                articles={filteredArticles}
                bookmarkedIds={bookmarkedIds}
                onOpenArticle={(id) => navigate(`/articles/${id}`)}
                onToggleBookmark={toggleBookmark}
                emptyTitle="기사가 없어요"
                emptySub="해당 카테고리의 기사가 아직 없습니다."
              />
            </div>
          </main>

          {/* US4: 위젯 패널 */}
          <aside className="xl:col-span-4 flex flex-col gap-4">
            <TrendingKeywordsWidget
              keywords={TRENDING_KEYWORDS}
              onPick={(kw) =>
                navigate(`/search?keyword=${encodeURIComponent(kw)}`)
              }
            />
            <BreakingTimelineWidget
              items={NEWS_HOME.slice(0, 5)}
              onOpen={(id) => navigate(`/articles/${id}`)}
            />
            <AIBriefingWidget briefing={AI_BRIEFING} />
          </aside>
        </div>
      </div>
    </div>
  );
}
