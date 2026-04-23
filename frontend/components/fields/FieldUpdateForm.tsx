'use client';

import React, { useState } from 'react';
import { CreateFieldUpdatePayload, Stage } from '@/types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ErrorMessage } from '@/components/ui/error-message';
import { getNextStages } from '@/lib/utils';
import styles from './FieldUpdateForm.module.css';

interface FieldUpdateFormProps {
  currentStage: Stage;
  isLoading?: boolean;
  error?: string;
  onSubmit: (data: CreateFieldUpdatePayload) => Promise<void>;
}

export function FieldUpdateForm({
  currentStage,
  isLoading = false,
  error,
  onSubmit,
}: FieldUpdateFormProps) {
  const [formData, setFormData] = useState<CreateFieldUpdatePayload>({
    stage: getNextStages(currentStage)[0] || currentStage,
    notes: '',
  });

  const [localError, setLocalError] = useState<string>('');
  const nextStages = getNextStages(currentStage);

  if (nextStages.length === 0) {
    return (
      <div className={styles.form}>
        <ErrorMessage message="Field is already in final stage (Harvested)" />
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stage) {
      setLocalError('Stage is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {(error || localError) && (
        <ErrorMessage message={error || localError} />
      )}

      <Select
        id="update-stage"
        label="New Stage"
        name="stage"
        value={formData.stage}
        onChange={handleChange}
        options={nextStages.map((stage) => ({
          value: stage,
          label: stage.charAt(0).toUpperCase() + stage.slice(1),
        }))}
        required
      />

      <Textarea
        id="update-notes"
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Add any observations or notes about this update..."
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Post Update
      </Button>
    </form>
  );
}
