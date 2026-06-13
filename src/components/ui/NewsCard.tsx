import type { NewsItem } from '@/types/news';
import CatBadge from './CatBadge';
import BiasChip from './BiasChip';
import ImgPlaceholder from './ImgPlaceholder';
import Icon from './Icon';

interface NewsCardProps {
  a: NewsItem;
  onOpen?: (a: NewsItem) => void;
  dense?: boolean;
}

export default function NewsCard({ a, onOpen, dense = false }: NewsCardProps) {
  const pad = dense ? 'p-3.5' : 'p-4';

  return (
    <button
      type="button"
      className="group text-left w-full bg-white border border-ink-200 rounded-card shadow-card overflow-hidden transition-all hover:border-brand/40 hover:shadow-cardhover flex flex-col"
      onClick={() => onOpen?.(a)}
      aria-label={a.title}
    >
      <ImgPlaceholder label={`${a.cat} 썸네일`} ratio="16/8" className="w-full" />
      <div className={`${pad} flex flex-col gap-2 flex-1`}>
        <div className="flex items-center gap-2 flex-wrap">
          <CatBadge cat={a.cat} />
          <BiasChip score={a.bias} />
        </div>
        <h4 className="display text-[14.5px] font-bold text-ink leading-snug clamp2 group-hover:text-brand transition-colors">
          {a.title}
        </h4>
        <div className="flex items-center gap-1.5 text-[12px] mt-auto">
          <span className="font-medium text-ink-500">{a.source}</span>
          <span className="text-ink-200">·</span>
          <span className="tnum text-ink-400">{a.time}</span>
          <div className="flex items-center gap-0.5 ml-auto text-ink-400 tnum">
            <Icon name="bookmark" size={13} stroke={1.5} />
            <span>{a.reads.toLocaleString('ko-KR')}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
