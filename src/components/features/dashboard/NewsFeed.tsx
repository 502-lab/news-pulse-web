import Icon from '@/components/ui/Icon';
import type { NewsItem } from '@/types/dashboard';
import NewsCard from './NewsCard';
import NewsFeedSkeleton from './NewsFeedSkeleton';

interface NewsFeedProps {
  items: NewsItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export default function NewsFeed({ items, isLoading, isError, refetch }: NewsFeedProps) {
  if (isLoading) {
    return <NewsFeedSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-ink-400">
        <p className="text-sm">뉴스를 불러올 수 없습니다.</p>
        <button
          onClick={refetch}
          aria-label="뉴스 다시 불러오기"
          className="text-brand text-sm hover:underline cursor-pointer"
        >
          재시도
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-10 text-ink-400">
        <Icon name="inbox" size={32} className="text-ink-400" />
        <p className="text-sm">표시할 뉴스가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul aria-label="뉴스 목록">
      {items.map((item) => (
        <li key={item.id}>
          <NewsCard item={item} />
        </li>
      ))}
    </ul>
  );
}
