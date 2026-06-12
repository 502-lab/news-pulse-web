import { useState, useEffect, useCallback, useRef } from 'react';
import type { CategoryData, UseQueryResult } from '@/types/dashboard';
import { fetchCategoryChart } from '@/mocks/dashboard.mock';

export function useCategoryChart(): UseQueryResult<CategoryData[]> {
  const [data, setData] = useState<CategoryData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const tickRef = useRef(0);

  const refetch = useCallback(() => {
    const id = ++tickRef.current;
    setIsLoading(true);
    setIsError(false);
    fetchCategoryChart()
      .then((result) => { if (tickRef.current === id) { setData(result); setIsLoading(false); } })
      .catch(() => { if (tickRef.current === id) { setIsError(true); setIsLoading(false); } });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { data, isLoading, isError, refetch };
}
