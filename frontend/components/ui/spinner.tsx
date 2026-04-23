import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn(styles.spinner, styles[size], className)} aria-label="Loading" />
  );
}
