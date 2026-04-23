'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserTable } from '@/components/users/UserTable';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useUsers } from '@/lib/hooks/useUsers';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { apiClient } from '@/lib/api';
import styles from './page.module.css';

export default function UsersPage() {
  const isAuthed = useRequireAuth(true);
  const { data: users, isLoading, error, refetch } = useUsers();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId?: number }>({ open: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (userId: number) => {
    setDeleteModal({ open: true, userId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteUser(deleteModal.userId);
      setDeleteModal({ open: false });
      refetch();
    } catch (err) {
      setIsDeleting(false);
    }
  };

  if (!isAuthed) return null;

  return (
    <div className={styles.container}>
      <PageHeader
        title="Users"
        description="Manage system users and permissions"
        actions={
          <Link href="/dashboard/users/new">
            <Button variant="primary">+ New User</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : users && users.length > 0 ? (
        <UserTable users={users} onDelete={handleDeleteClick} />
      ) : (
        <p className={styles.empty}>No users found</p>
      )}

      <Modal
        isOpen={deleteModal.open}
        title="Delete User"
        onClose={() => setDeleteModal({ open: false })}
        actions={{
          confirm: {
            label: 'Delete',
            onClick: handleDeleteConfirm,
            variant: 'danger',
          },
          cancel: {
            label: 'Cancel',
            onClick: () => setDeleteModal({ open: false }),
          },
        }}
      >
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
