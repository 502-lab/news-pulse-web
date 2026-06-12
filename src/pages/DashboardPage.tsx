import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCategoryChart } from '@/hooks/useCategoryChart';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import {
  StatCard,
  StatCardSkeleton,
  CategoryChart,
  CategoryChartSkeleton,
  NewsFeed,
} from '@/components/features/dashboard';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function DashboardPage() {
  const stats = useDashboardStats();
  const chart = useCategoryChart();
  const feed = useNewsFeed();

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* StatCard 그리드 */}
      <section aria-label="통계 현황">
        <ErrorBoundary
          fallback={
            <p className="text-ink-400 text-sm">데이터를 불러올 수 없습니다.</p>
          }
        >
          {stats.isError ? (
            <p className="text-ink-400 text-sm">데이터를 불러올 수 없습니다.</p>
          ) : stats.isLoading || !stats.data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.data.map((s) => (
                <StatCard key={s.id} stat={s} />
              ))}
            </div>
          )}
        </ErrorBoundary>
      </section>

      {/* 카테고리 바차트 */}
      <section aria-label="카테고리별 뉴스 분포">
        <h2 className="text-ink text-base font-semibold mb-4">카테고리별 뉴스 현황</h2>
        <ErrorBoundary
          fallback={
            <p className="text-ink-400 text-sm">데이터를 불러올 수 없습니다.</p>
          }
        >
          {chart.isError ? (
            <CategoryChart data={[]} isError={true} refetch={chart.refetch} />
          ) : chart.isLoading || !chart.data ? (
            <CategoryChartSkeleton />
          ) : (
            <CategoryChart data={chart.data} isError={false} refetch={chart.refetch} />
          )}
        </ErrorBoundary>
      </section>

      {/* 뉴스 피드 */}
      <section aria-label="최신 뉴스">
        <h2 className="text-ink text-base font-semibold mb-4">최신 뉴스</h2>
        <ErrorBoundary
          fallback={
            <p className="text-ink-400 text-sm">뉴스를 불러올 수 없습니다.</p>
          }
        >
          <NewsFeed
            items={feed.data ?? []}
            isLoading={feed.isLoading}
            isError={feed.isError}
            refetch={feed.refetch}
          />
        </ErrorBoundary>
      </section>
    </div>
  );
}
