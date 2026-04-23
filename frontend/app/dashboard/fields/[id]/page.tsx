'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useField } from '@/lib/hooks/useField';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { FieldUpdateFeed } from '@/components/fields/FieldUpdateFeed';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  formatDate,
  calculateDaysElapsed,
  getCropDayLimit,
} from '@/lib/utils';
import styles from './page.module.css';

export default function FieldDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { data: field, isLoading, error, refetch } = useField(
    parseInt(params.id)
  );
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.deleteField(parseInt(params.id));
      router.push('/dashboard/fields');
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteModal(false);
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

  const daysElapsed = calculateDaysElapsed(field.planting_date);
  const cropDayLimit = getCropDayLimit(field.crop_type);
  const daysRemaining = cropDayLimit - daysElapsed;
  const progressPercent = (daysElapsed / cropDayLimit) * 100;

  return (
    <div className={styles.container}>
      <PageHeader
        title={field.name}
        actions={
          isAdmin && (
            <div className={styles.actions}>
              <Link href={`/dashboard/fields/${field.id}/edit`}>
                <Button variant="secondary">Edit Field</Button>
              </Link>
              <Link href={`/dashboard/fields/${field.id}#update`}>
                <Button variant="primary">+ Post Update</Button>
              </Link>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          )
        }
      />

      <div className={styles.layout}>
        {/* Left column */}
        <div className={styles.leftColumn}>
          <Card>
            <div className={styles.fieldHeader}>
              <div className={styles.badges}>
                <Badge variant="stage" value={field.stage} />
                <Badge variant="status" value={field.status} />
              </div>
            </div>

            <div className={styles.info}>
              <div className={styles.infoGroup}>
                <label>Crop Type</label>
                <p>{field.crop_type}</p>
              </div>

              <div className={styles.infoGroup}>
                <label>Planting Date</label>
                <p>{formatDate(field.planting_date)}</p>
              </div>

              <div className={styles.infoGroup}>
                <label>Days Elapsed</label>
                <p>
                  {daysElapsed} / {cropDayLimit} days ({progressPercent.toFixed(0)}%)
                </p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              {field.assigned_agent_detail && (
                <div className={styles.infoGroup}>
                  <label>Assigned Agent</label>
                  <p>
                    {field.assigned_agent_detail.first_name}{' '}
                    {field.assigned_agent_detail.last_name}
                  </p>
                </div>
              )}

              <div className={styles.infoGroup}>
                <label>Created By</label>
                <p>
                  {field.created_by_detail.first_name}{' '}
                  {field.created_by_detail.last_name}
                </p>
              </div>

              <div className={styles.infoGroup}>
                <label>Created</label>
                <p>{formatDate(field.created_at)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className={styles.rightColumn}>
          <Card>
            <h2 className={styles.updateTitle}>Update History</h2>
            {field.updates && field.updates.length > 0 ? (
              <FieldUpdateFeed updates={field.updates} />
            ) : (
              <p className={styles.empty}>No updates yet</p>
            )}

            {!isAdmin && (
              <Link href={`/dashboard/fields/${field.id}/update`}>
                <Button variant="primary" className={styles.updateBtn}>
                  + Post Update
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Field"
        onClose={() => setShowDeleteModal(false)}
        actions={{
          confirm: {
            label: 'Delete',
            onClick: handleDelete,
            variant: 'danger',
          },
          cancel: {
            label: 'Cancel',
            onClick: () => setShowDeleteModal(false),
          },
        }}
      >
        <p>
          Are you sure you want to delete &quot;{field.name}&quot;? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
