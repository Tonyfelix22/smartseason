import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'role' | 'stage' | 'status';
  value?: string;
}

export function Badge({
  className,
  variant = 'default',
  value,
  children,
  ...props
}: BadgeProps) {
  const content = value || children;
  const styleValue = (value || '').toLowerCase().replace(' ', '-');
  
  return (
    <span
      className={cn(
        styles.badge,
        styles[variant],
        styles[styleValue],
        className
      )}
      {...props}
    >
      {content}
    </span>
  );
}
