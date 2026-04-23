import Link from 'next/link';
import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import styles from './UserTable.module.css';

interface UserTableProps {
  users: User[];
  onDelete?: (id: number) => void;
}

export function UserTable({ users, onDelete }: UserTableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>#{user.id}</td>
              <td>
                {user.first_name} {user.last_name}
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <Badge variant="role" value={user.role} />
              </td>
              <td className={styles.actions}>
                <Link href={`/dashboard/users/${user.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
