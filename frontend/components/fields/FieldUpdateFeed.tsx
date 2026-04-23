import { FieldUpdate } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, getRelativeTime, getInitials } from '@/lib/utils';
import styles from './FieldUpdateFeed.module.css';

interface FieldUpdateFeedProps {
  updates: FieldUpdate[];
}

export function FieldUpdateFeed({ updates }: FieldUpdateFeedProps) {
  if (updates.length === 0) {
    return <p className={styles.empty}>No updates yet</p>;
  }

  return (
    <div className={styles.feed}>
      {updates.map((update) => (
        <div key={update.id} className={styles.updateItem}>
          <div className={styles.avatar}>
            {getInitials(
              update.agent_detail.first_name,
              update.agent_detail.last_name
            )}
          </div>
          <div className={styles.content}>
            <div className={styles.header}>
              <span className={styles.agentName}>
                {update.agent_detail.first_name}{' '}
                {update.agent_detail.last_name}
              </span>
              <Badge variant="stage" value={update.stage} />
            </div>
            {update.notes && <p className={styles.notes}>{update.notes}</p>}
            <time className={styles.timestamp} title={formatDateTime(update.created_at)}>
              {getRelativeTime(update.created_at)}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}
