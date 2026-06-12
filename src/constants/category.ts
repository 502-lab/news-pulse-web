export interface CategoryMeta {
  label: string;
  className: string;
  chartColor: string;
}

export const CATEGORY_MAP: Record<string, CategoryMeta> = {
  politics: {
    label: '정치',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    chartColor: '#ef4444',
  },
  economy: {
    label: '경제',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    chartColor: '#3b82f6',
  },
  society: {
    label: '사회',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    chartColor: '#eab308',
  },
  technology: {
    label: '기술',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    chartColor: '#a855f7',
  },
  culture: {
    label: '문화',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    chartColor: '#22c55e',
  },
  sports: {
    label: '스포츠',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    chartColor: '#f97316',
  },
};

export function getCategoryMeta(category: string): CategoryMeta {
  return (
    CATEGORY_MAP[category] ?? {
      label: category,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      chartColor: '#6b7280',
    }
  );
}
