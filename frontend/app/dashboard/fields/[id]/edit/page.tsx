'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { CreateFieldPayload, Field, User } from '@/types';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { FieldForm } from '@/components/fields/FieldForm';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import styles from './page.module.css';

export default function EditFieldPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const isAdmin = useRequireAuth(true);
  const [field, setField] = useState<Field | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldData, usersData] = await Promise.all([
          apiClient.getField(parseInt(params.id)),
          apiClient.listUsers(),
        ]);
        setField(fieldData);
        setAgents(usersData.filter((u) => u.role === 'agent'));
      } catch (err) {
        if (typeof err === 'object' && err && 'detail' in err) {
          setError((err as any).detail || 'Failed to load data');
        } else {
          setError('Failed to load data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [params.id, isAdmin]);

  const handleSubmit = async (data: CreateFieldPayload) => {
    setError('');
    setIsSubmitting(true);

    try {
      await apiClient.updateField(parseInt(params.id), data);
      router.push(`/dashboard/fields/${params.id}`);
    } catch (err) {
      if (typeof err === 'object' && err && 'detail' in err) {
        setError((err as any).detail || 'Failed to update field');
      } else {
        setError('Failed to update field');
      }
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
        <p>Loading field data...</p>
      </div>
    );
  }

  if (error || !field) {
    return <ErrorMessage message={error || 'Field not found'} />;
  }

  return (
    <div className={styles.container}>
      <PageHeader title={`Edit Field: ${field.name}`} />
      <FieldForm
        initialData={{
          name: field.name,
          crop_type: field.crop_type,
          planting_date: field.planting_date,
          stage: field.stage,
          assigned_agent: field.assigned_agent,
        }}
        isLoading={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        agents={agents}
      />
    </div>
  );
}
