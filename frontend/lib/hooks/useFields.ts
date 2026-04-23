'use client';

import { useEffect, useState } from 'react';
import { Field, ApiError } from '@/types';
import { apiClient } from '@/lib/api';

interface UseFieldsResult {
  data: Field[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFields(): UseFieldsResult {
  const [data, setData] = useState<Field[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fields = await apiClient.listFields();
      setData(fields);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to fetch fields');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, isLoading, error, refetch: fetch };
}
