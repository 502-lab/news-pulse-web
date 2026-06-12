import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Icon from '@/components/ui/Icon';
import { getCategoryMeta } from '@/constants/category';
import type { NewsItem } from '@/types/dashboard';

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !item.thumbnailUrl || imgError;

  const relativeTime = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
    locale: ko,
  });

  const { label: categoryLabel, className: categoryClass } = getCategoryMeta(item.category);

  return (
    <article className="flex gap-4 p-4 border-b border-white/5 hover:bg-white/3 transition-colors">
      <Link
        to={`/articles/${item.id}`}
        className="flex gap-4 flex-1 min-w-0"
        aria-label={item.title}
      >
        {showFallback ? (
          <div
            className="w-40 h-[90px] bg-white/10 flex items-center justify-center rounded-lg shrink-0"
            aria-hidden="true"
          >
            <Icon name="Newspaper" size={24} className="text-ink-400" />
          </div>
        ) : (
          <img
            src={item.thumbnailUrl!}
            alt={item.title}
            loading="lazy"
            className="w-40 h-[90px] object-cover rounded-lg shrink-0"
            onError={() => setImgError(true)}
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <p className="text-ink text-sm font-medium clamp2">{item.title}</p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-ink-400 text-xs">{item.source}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryClass}`}
            >
              {categoryLabel}
            </span>
            <time
              dateTime={item.publishedAt}
              className="text-ink-400 text-xs ml-auto"
            >
              {relativeTime}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}
