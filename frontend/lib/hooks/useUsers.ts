'use client';

import { useEffect, useState } from 'react';
import { User, ApiError } from '@/types';
import { apiClient } from '@/lib/api';

interface UseUsersResult {
  data: User[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(): UseUsersResult {
  const [data, setData] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const users = await apiClient.listUsers();
      setData(users);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, isLoading, error, refetch: fetch };
}
