import Link from 'next/link';
import { Leaf, User, Calendar, MapPin } from 'lucide-react';
import { Field } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import styles from './field-card.module.css';

interface FieldCardProps {
  field: Field;
}

export function FieldCard({ field }: FieldCardProps) {
  return (
    <Link href={`/dashboard/fields/${field.id}`} className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.nameRow}>
              <Leaf size={14} className={styles.icon} />
              <h3 className={styles.name}>{field.name}</h3>
            </div>
            <span className={styles.crop}>{field.crop_type}</span>
          </div>
          <Badge variant="status" value={field.status} />
        </div>

        <div className={styles.body}>
          <div className={styles.item}>
            <div className={styles.itemLabel}>
              <MapPin size={12} />
              <span>Stage</span>
            </div>
            <Badge variant="stage" value={field.stage} />
          </div>
          <div className={styles.item}>
            <div className={styles.itemLabel}>
              <Calendar size={12} />
              <span>Planted</span>
            </div>
            <span className={styles.value}>{formatDate(field.planting_date)}</span>
          </div>
        </div>

        {field.assigned_agent_detail && (
          <div className={styles.footer}>
            <div className={styles.agentInfo}>
              <div className={styles.agentAvatar}>
                <User size={12} />
              </div>
              <div className={styles.agentText}>
                <span className={styles.agentLabel}>Assigned Agent</span>
                <span className={styles.agentName}>
                  {field.assigned_agent_detail.first_name} {field.assigned_agent_detail.last_name}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
