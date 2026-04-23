'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { RegisterPayload, User } from '@/types';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserForm } from '@/components/users/UserForm';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import styles from './page.module.css';

export default function EditUserPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isAuthed = useRequireAuth(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient.getUser(parseInt(params.id));
        setUser(data);
      } catch (err) {
        if (typeof err === 'object' && err && 'detail' in err) {
          setError((err as any).detail || 'Failed to load user');
        } else {
          setError('Failed to load user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleSubmit = async (data: RegisterPayload) => {
    setError('');
    setIsSubmitting(true);

    try {
      await apiClient.updateUser(parseInt(params.id), {
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      router.push('/dashboard/users');
    } catch (err) {
      if (typeof err === 'object' && err && 'detail' in err) {
        setError((err as any).detail || 'Failed to update user');
      } else {
        setError('Failed to update user');
      }
      setIsSubmitting(false);
    }
  };

  if (!isAuthed) return null;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
        <p>Loading user...</p>
      </div>
    );
  }

  if (error || !user) {
    return <ErrorMessage message={error || 'User not found'} />;
  }

  return (
    <div className={styles.container}>
      <PageHeader title={`Edit User: ${user.first_name} ${user.last_name}`} />
      <UserForm
        initialData={user}
        isCreate={false}
        isLoading={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
