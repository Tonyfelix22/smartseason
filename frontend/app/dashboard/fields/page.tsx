'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { FieldCard } from '@/components/fields/FieldCard';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useFields } from '@/lib/hooks/useFields';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf } from 'lucide-react';
import styles from './page.module.css';

export default function FieldsPage() {
  const { data: fields, isLoading, error } = useFields();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFields = useMemo(() => {
    if (!fields) return [];
    return fields.filter((field) => {
      const matchesSearch =
        field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.crop_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage =
        stageFilter === 'all' || field.stage === stageFilter;

      const matchesStatus =
        statusFilter === 'all' || field.status === statusFilter;

      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [fields, searchQuery, stageFilter, statusFilter]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Fields"
        description="Manage and monitor all fields"
        actions={
          isAdmin && (
            <Link href="/dashboard/fields/new">
              <Button variant="primary">+ New Field</Button>
            </Link>
          )
        }
      />

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
          <p>Loading fields...</p>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          {/* Search and Filters */}
          <div className={styles.controls}>
            <Input
              id="field-search"
              placeholder="Search by name or crop type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className={styles.filters}>
              <select
                className={styles.filterSelect}
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="ready">Ready</option>
                <option value="harvested">Harvested</option>
              </select>

              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Fields Grid */}
          {filteredFields.length > 0 ? (
            <div className={styles.grid}>
              {filteredFields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Leaf}
              title="No fields found"
              description={
                searchQuery || stageFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create a new field to get started'
              }
              action={
                isAdmin && !searchQuery && stageFilter === 'all' && statusFilter === 'all'
                  ? {
                      label: 'Create First Field',
                      onClick: () =>
                        (window.location.href = '/dashboard/fields/new'),
                    }
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
}
