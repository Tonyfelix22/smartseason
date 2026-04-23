'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateFieldPayload } from '@/types';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useUsers } from '@/lib/hooks/useUsers';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { FieldForm } from '@/components/fields/FieldForm';
import { Spinner } from '@/components/ui/spinner';
import styles from './page.module.css';

export default function CreateFieldPage() {
  const router = useRouter();
  const isAuthed = useRequireAuth(true);
  const { data: users } = useUsers();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agents = users?.filter((u) => u.role === 'agent') || [];

  const handleSubmit = async (data: CreateFieldPayload) => {
    setError('');
    setIsLoading(true);

    try {
      await apiClient.createField(data);
      router.push('/dashboard/fields');
    } catch (err) {
      if (typeof err === 'object' && err && 'detail' in err) {
        setError((err as any).detail || 'Failed to create field');
      } else {
        setError('Failed to create field');
      }
      setIsLoading(false);
    }
  };

  if (!isAuthed) return null;

  if (!users) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Create New Field" />
      <FieldForm
        agents={agents}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
