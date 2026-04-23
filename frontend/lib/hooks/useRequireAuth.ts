'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(requireAdmin: boolean = false): boolean {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (requireAdmin && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, requireAdmin, router]);

  return !isLoading && !!user && (!requireAdmin || user.role === 'admin');
}
