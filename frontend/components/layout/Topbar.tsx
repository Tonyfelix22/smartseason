import React from 'react';
import Link from 'next/link';
import styles from './Topbar.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  if (!breadcrumbs) return <div className={styles.empty} />;

  return (
    <header className={styles.topbar}>
      <nav className={styles.breadcrumbs}>
        <Link href="/dashboard" className={styles.breadcrumb}>
          Dashboard
        </Link>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <span className={styles.separator}>/</span>
            {item.href ? (
              <Link href={item.href} className={styles.breadcrumb}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </header>
  );
}
