import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './error-message.module.css';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className={styles.container}>
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}
