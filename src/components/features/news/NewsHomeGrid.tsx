import EmptyState from '@/components/ui/EmptyState';
import NewsHomeCard from './NewsHomeCard';
import type { NewsItem } from '@/types/news';

interface NewsHomeGridProps {
  articles: NewsItem[];
  bookmarkedIds: Set<string>;
  onOpenArticle: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  emptyTitle: string;
  emptySub: string;
}

export default function NewsHomeGrid({
  articles,
  bookmarkedIds,
  onOpenArticle,
  onToggleBookmark,
  emptyTitle,
  emptySub,
}: NewsHomeGridProps) {
  if (articles.length === 0) {
    return <EmptyState title={emptyTitle} sub={emptySub} />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {articles.map((article) => (
        <NewsHomeCard
          key={article.id}
          article={article}
          bookmarked={bookmarkedIds.has(article.id)}
          onOpen={onOpenArticle}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
