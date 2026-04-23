'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RegisterPayload } from '@/types';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserForm } from '@/components/users/UserForm';
import styles from './page.module.css';

export default function CreateUserPage() {
  const router = useRouter();
  const isAuthed = useRequireAuth(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RegisterPayload) => {
    setError('');
    setIsLoading(true);

    try {
      await apiClient.register(data);
      router.push('/dashboard/users');
    } catch (err) {
      if (typeof err === 'object' && err && 'detail' in err) {
        setError((err as any).detail || 'Failed to create user');
      } else if (typeof err === 'object' && err && 'username' in err) {
        setError((err as any).username?.[0] || 'Failed to create user');
      } else {
        setError('Failed to create user');
      }
      setIsLoading(false);
    }
  };

  if (!isAuthed) return null;

  return (
    <div className={styles.container}>
      <PageHeader title="Register New User" />
      <UserForm
        isCreate={true}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
