'use client';

import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';

interface UseFetchOptions {
  skip?: boolean;
}

export function useFetch<T>(
  endpoint: string,
  options?: UseFetchOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options?.skip) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<T>(endpoint);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch');
        }

        setData(response.data || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, options?.skip]);

  return { data, loading, error };
}
