import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'outline';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(styles.card, styles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
