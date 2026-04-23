'use client';

import React, { useState } from 'react';
import { RegisterPayload, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ErrorMessage } from '@/components/ui/error-message';
import styles from './UserForm.module.css';

interface UserFormProps {
  initialData?: Partial<RegisterPayload>;
  isCreate?: boolean;
  isLoading?: boolean;
  error?: string;
  onSubmit: (data: RegisterPayload) => Promise<void>;
}

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'agent', label: 'Agent' },
];

export function UserForm({
  initialData,
  isCreate = true,
  isLoading = false,
  error,
  onSubmit,
}: UserFormProps) {
  const [formData, setFormData] = useState<RegisterPayload>(
    initialData
      ? {
          first_name: initialData.first_name || '',
          last_name: initialData.last_name || '',
          username: initialData.username || '',
          email: initialData.email || '',
          password: '',
          role: initialData.role || 'agent',
        }
      : {
          first_name: '',
          last_name: '',
          username: '',
          email: '',
          password: '',
          role: 'agent',
        }
  );

  const [localError, setLocalError] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (!formData.first_name.trim()) {
      setLocalError('First name is required');
      return;
    }

    if (!formData.last_name.trim()) {
      setLocalError('Last name is required');
      return;
    }

    if (!formData.username.trim()) {
      setLocalError('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }

    if (isCreate && !formData.password) {
      setLocalError('Password is required');
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
        id="user-first-name"
        label="First Name"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        required
      />

      <Input
        id="user-last-name"
        label="Last Name"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        required
      />

      <Input
        id="user-username"
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <Input
        id="user-email"
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      {isCreate && (
        <Input
          id="user-password"
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      )}

      <Select
        id="user-role"
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={ROLE_OPTIONS}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isCreate ? 'Create User' : 'Update User'}
      </Button>
    </form>
  );
}
