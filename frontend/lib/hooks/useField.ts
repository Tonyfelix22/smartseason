'use client';

import { useEffect, useState } from 'react';
import { Field, ApiError } from '@/types';
import { apiClient } from '@/lib/api';

interface UseFieldResult {
  data: Field | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useField(id: number): UseFieldResult {
  const [data, setData] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const field = await apiClient.getField(id);
      setData(field);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to fetch field');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [id]);

  return { data, isLoading, error, refetch: fetch };
}
