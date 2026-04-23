'use client';

import { useRouter } from 'next/navigation';
import { useState, use } from 'react';
import { CreateFieldUpdatePayload } from '@/types';
import { useField } from '@/lib/hooks/useField';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { FieldUpdateForm } from '@/components/fields/FieldUpdateForm';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import styles from './page.module.css';

export default function FieldUpdatePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { data: field, isLoading, error } = useField(parseInt(params.id));
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateFieldUpdatePayload) => {
    setFormError('');
    setIsSubmitting(true);

    try {
      await apiClient.createFieldUpdate(parseInt(params.id), data);
      router.push(`/dashboard/fields/${params.id}`);
    } catch (err) {
      if (typeof err === 'object' && err && 'detail' in err) {
        setFormError((err as any).detail || 'Failed to post update');
      } else {
        setFormError('Failed to post update');
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
        <p>Loading field...</p>
      </div>
    );
  }

  if (error || !field) {
    return <ErrorMessage message={error || 'Field not found'} />;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title={`Update: ${field.name}`}
        description={`Current stage: ${field.stage}`}
      />
      <FieldUpdateForm
        currentStage={field.stage}
        isLoading={isSubmitting}
        error={formError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
