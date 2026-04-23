'use client';

import { useEffect, useState } from 'react';
import { FieldUpdate, ApiError } from '@/types';
import { apiClient } from '@/lib/api';

interface UseRecentUpdatesResult {
  data: FieldUpdate[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecentUpdates(): UseRecentUpdatesResult {
  const [data, setData] = useState<FieldUpdate[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updates = await apiClient.listRecentUpdates();
      setData(updates);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to fetch updates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, isLoading, error, refetch: fetch };
}
