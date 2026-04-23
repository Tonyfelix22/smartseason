import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: {
    confirm?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'danger';
      isLoading?: boolean;
    };
    cancel?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <Card className={styles.modalCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          
          <div className={styles.body}>{children}</div>

          {actions && (
            <div className={styles.footer}>
              {actions.cancel && (
                <Button variant="ghost" onClick={actions.cancel.onClick}>
                  {actions.cancel.label}
                </Button>
              )}
              {actions.confirm && (
                <Button
                  variant={actions.confirm.variant || 'primary'}
                  onClick={actions.confirm.onClick}
                  isLoading={actions.confirm.isLoading}
                >
                  {actions.confirm.label}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
