'use client';

import React, { useState } from 'react';
import { CreateFieldPayload, Stage, CropType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ErrorMessage } from '@/components/ui/error-message';
import styles from './FieldForm.module.css';

interface FieldFormProps {
  initialData?: CreateFieldPayload;
  isLoading?: boolean;
  error?: string;
  onSubmit: (data: CreateFieldPayload) => Promise<void>;
  agents: Array<{ id: number; first_name: string; last_name: string }>;
}

const CROP_OPTIONS = [
  { value: 'maize', label: 'Maize' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'rice', label: 'Rice' },
  { value: 'beans', label: 'Beans' },
];

const STAGE_OPTIONS: Array<{ value: Stage; label: string }> = [
  { value: 'planted', label: 'Planted' },
  { value: 'growing', label: 'Growing' },
  { value: 'ready', label: 'Ready' },
  { value: 'harvested', label: 'Harvested' },
];

export function FieldForm({
  initialData,
  isLoading = false,
  error,
  onSubmit,
  agents,
}: FieldFormProps) {
  const [formData, setFormData] = useState<CreateFieldPayload>(
    initialData || {
      name: '',
      crop_type: 'maize',
      planting_date: '',
      stage: 'planted',
      assigned_agent: null,
    }
  );

  const [localError, setLocalError] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'assigned_agent' ? (value ? parseInt(value) : null) : value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setLocalError('Field name is required');
      return;
    }

    if (!formData.planting_date) {
      setLocalError('Planting date is required');
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

      <Input
        id="field-name"
        label="Field Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., North Field A"
        required
      />

      <Select
        id="field-crop-type"
        label="Crop Type"
        name="crop_type"
        value={formData.crop_type}
        onChange={handleChange}
        options={CROP_OPTIONS}
      />

      <Input
        id="field-planting-date"
        label="Planting Date"
        name="planting_date"
        type="date"
        value={formData.planting_date}
        onChange={handleChange}
        required
      />

      <Select
        id="field-stage"
        label="Current Stage"
        name="stage"
        value={formData.stage}
        onChange={handleChange}
        options={STAGE_OPTIONS}
      />

      <Select
        id="field-assigned-agent"
        label="Assigned Agent (Optional)"
        name="assigned_agent"
        value={formData.assigned_agent?.toString() || ''}
        onChange={handleChange}
        options={agents.map((agent) => ({
          value: agent.id,
          label: `${agent.first_name} ${agent.last_name}`,
        }))}
        placeholder="Select an agent..."
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {initialData ? 'Update Field' : 'Create Field'}
      </Button>
    </form>
  );
}
