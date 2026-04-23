'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: 'agent',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.register({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role: formData.role,
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>🌾</span>
          <h1 className={styles.title}>Join Smartseason</h1>
          <p className={styles.subtitle}>Create your agent account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <ErrorMessage message={error} />}

          <div className={styles.row}>
            <Input
              id="first_name"
              label="First Name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              id="last_name"
              label="Last Name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            id="username"
            label="Username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Min. 8 characters"
          />

          <Input
            id="confirm_password"
            label="Confirm Password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />

          <div className={styles.group}>
            <label htmlFor="role" className={styles.label}>Register as</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={styles.select}
            >
              <option value="agent">Agent</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Create Account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </Card>
    </main>
  );
}
