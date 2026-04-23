'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { FieldCard } from '@/components/fields/FieldCard';
import { Spinner } from '@/components/ui/spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useFields } from '@/lib/hooks/useFields';
import { useRecentUpdates } from '@/lib/hooks/useRecentUpdates';
import { getRelativeTime } from '@/lib/utils';
import styles from './page.module.css';

export default function DashboardPage() {
  const { data: fields, isLoading: fieldsLoading, error: fieldsError } = useFields();
  const { data: recentUpdates, isLoading: updatesLoading, error: updatesError } = useRecentUpdates();

  const stats = useMemo(() => {
    // Robust check for array type to prevent crashes during SSR or if API fails
    if (!fields || !Array.isArray(fields)) {
      return { total: 0, active: 0, harvested: 0 };
    }
    
    return {
      total: fields.length,
      active: fields.filter(f => f && f.stage !== 'harvested').length,
      harvested: fields.filter(f => f && f.stage === 'harvested').length,
    };
  }, [fields]);

  const isLoading = fieldsLoading || updatesLoading;
  const error = fieldsError || updatesError;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={styles.dashboard}>
      <PageHeader title="Overview" />

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <Card className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconTeal}`}>
            <span>📊</span>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Fields</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <span>🌱</span>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>In Progress</span>
            <span className={styles.statValue}>{stats.active}</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <span>✅</span>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Harvested</span>
            <span className={styles.statValue}>{stats.harvested}</span>
          </div>
        </Card>
      </div>

      <div className={styles.grid}>
        {/* Main Content: Fields List */}
        <section className={styles.main}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tracked Fields</h2>
            <Link href="/dashboard/fields" className={styles.viewAll}>
              View all
            </Link>
          </div>
          
          <div className={styles.fieldGrid}>
            {fields && fields.length > 0 ? (
              fields.slice(0, 6).map((field) => (
                <FieldCard key={field.id} field={field} />
              ))
            ) : (
              <p className={styles.empty}>No fields being tracked.</p>
            )}
          </div>
        </section>

        {/* Sidebar: Recent Activity */}
        <aside className={styles.aside}>
          <h2 className={styles.sectionTitle}>Activity</h2>
          <div className={styles.activityFeed}>
            {recentUpdates && recentUpdates.length > 0 ? (
              recentUpdates.map((update) => (
                <div key={update.id} className={styles.activityItem}>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <span className={styles.bold}>
                        {update.agent_detail?.first_name || 'Agent'}
                      </span>{' '}
                      updated{' '}
                      <Link href={`/dashboard/fields/${update.field}`} className={styles.link}>
                        {update.field_name}
                      </Link>
                    </p>
                    <time className={styles.timestamp}>
                      {getRelativeTime(update.created_at)}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No recent updates.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
