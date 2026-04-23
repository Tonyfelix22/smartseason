import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className={styles.error}>
      <AlertCircle size={20} />
      <p>{message}</p>
      {onDismiss && (
        <button className={styles.dismiss} onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
