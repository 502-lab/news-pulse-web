import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BreakingBanner from '@/components/features/news/BreakingBanner';
import CategoryFilter from '@/components/features/news/CategoryFilter';
import NewsHomeCard from '@/components/features/news/NewsHomeCard';
import NewsHomeGrid from '@/components/features/news/NewsHomeGrid';
import TrendingKeywordsWidget from '@/components/features/news/TrendingKeywordsWidget';
import AIBriefingWidget from '@/components/features/news/AIBriefingWidget';
import { HOME_CATEGORY_FILTERS } from '@/constants/categories';
import { NEWS_HOME, TRENDING_KEYWORDS, AI_BRIEFING } from '@/mocks/newsHome.mock';

const mockArticle = NEWS_HOME[0];

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('BreakingBanner', () => {
  it('renders title and source', () => {
    wrap(<BreakingBanner article={mockArticle} onOpen={vi.fn()} />);
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockArticle.source))).toBeInTheDocument();
  });

  it('calls onOpen with article id when 바로 읽기 clicked', () => {
    const onOpen = vi.fn();
    wrap(<BreakingBanner article={mockArticle} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /바로 읽기/ }));
    expect(onOpen).toHaveBeenCalledWith(mockArticle.id);
  });
});

describe('CategoryFilter', () => {
  it('renders all category buttons', () => {
    wrap(
      <CategoryFilter
        categories={HOME_CATEGORY_FILTERS}
        active="전체"
        onChange={vi.fn()}
        resultCount={10}
      />,
    );
    HOME_CATEGORY_FILTERS.forEach((cat) => {
      expect(screen.getByRole('button', { name: cat })).toBeInTheDocument();
    });
  });

  it('active button has aria-pressed=true', () => {
    wrap(
      <CategoryFilter
        categories={HOME_CATEGORY_FILTERS}
        active="기술"
        onChange={vi.fn()}
        resultCount={3}
      />,
    );
    expect(screen.getByRole('button', { name: '기술' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a category is clicked', () => {
    const onChange = vi.fn();
    wrap(
      <CategoryFilter
        categories={HOME_CATEGORY_FILTERS}
        active="전체"
        onChange={onChange}
        resultCount={13}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '경제' }));
    expect(onChange).toHaveBeenCalledWith('경제');
  });

  it('displays result count', () => {
    wrap(
      <CategoryFilter
        categories={HOME_CATEGORY_FILTERS}
        active="전체"
        onChange={vi.fn()}
        resultCount={7}
      />,
    );
    expect(screen.getByText(/7건/)).toBeInTheDocument();
  });
});

describe('NewsHomeCard', () => {
  it('renders article title and source', () => {
    wrap(
      <NewsHomeCard
        article={mockArticle}
        bookmarked={false}
        onOpen={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });

  it('bookmark button has aria-pressed=false when not bookmarked', () => {
    wrap(
      <NewsHomeCard
        article={mockArticle}
        bookmarked={false}
        onOpen={vi.fn()}
        onToggleBookmark={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: '북마크 추가' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onToggleBookmark with article id when bookmark button clicked', () => {
    const onToggle = vi.fn();
    wrap(
      <NewsHomeCard
        article={mockArticle}
        bookmarked={false}
        onOpen={vi.fn()}
        onToggleBookmark={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '북마크 추가' }));
    expect(onToggle).toHaveBeenCalledWith(mockArticle.id);
  });
});

describe('NewsHomeGrid', () => {
  it('renders EmptyState when articles is empty', () => {
    wrap(
      <NewsHomeGrid
        articles={[]}
        bookmarkedIds={new Set()}
        onOpenArticle={vi.fn()}
        onToggleBookmark={vi.fn()}
        emptyTitle="기사가 없어요"
        emptySub="테스트 빈 상태"
      />,
    );
    expect(screen.getByText('기사가 없어요')).toBeInTheDocument();
  });

  it('renders cards when articles provided', () => {
    wrap(
      <NewsHomeGrid
        articles={NEWS_HOME.slice(0, 3)}
        bookmarkedIds={new Set()}
        onOpenArticle={vi.fn()}
        onToggleBookmark={vi.fn()}
        emptyTitle="없음"
        emptySub="없음"
      />,
    );
    expect(screen.getByText(NEWS_HOME[0].title)).toBeInTheDocument();
  });
});

describe('TrendingKeywordsWidget', () => {
  it('renders all keywords', () => {
    wrap(<TrendingKeywordsWidget keywords={TRENDING_KEYWORDS} onPick={vi.fn()} />);
    TRENDING_KEYWORDS.forEach((kw) => {
      expect(screen.getByText(kw.keyword)).toBeInTheDocument();
    });
  });

  it('calls onPick with keyword when button clicked', () => {
    const onPick = vi.fn();
    wrap(<TrendingKeywordsWidget keywords={TRENDING_KEYWORDS} onPick={onPick} />);
    fireEvent.click(screen.getByText(TRENDING_KEYWORDS[0].keyword));
    expect(onPick).toHaveBeenCalledWith(TRENDING_KEYWORDS[0].keyword);
  });
});

describe('AIBriefingWidget', () => {
  it('renders all briefing sentences', () => {
    wrap(<AIBriefingWidget briefing={AI_BRIEFING} />);
    AI_BRIEFING.sentences.forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument();
    });
  });

  it('renders generatedAt footer', () => {
    wrap(<AIBriefingWidget briefing={AI_BRIEFING} />);
    expect(screen.getByText(AI_BRIEFING.generatedAt)).toBeInTheDocument();
  });
});
