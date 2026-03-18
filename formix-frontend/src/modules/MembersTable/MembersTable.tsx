import type { Member } from '@/services/organizations/organizations.types';
import { RoleBadge } from './RoleBadge';
import styles from './MembersTable.module.css';

interface MembersTableProps {
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  onRemove?: (userId: string) => void;
}

export function MembersTable({ members, currentUserId, isAdmin, onRemove }: MembersTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Lista de membros">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Função</th>
            <th>Entrou em</th>
            {isAdmin && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.userId}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>
                <RoleBadge role={member.role} />
              </td>
              <td>{new Date(member.joinedAt).toLocaleDateString('pt-BR')}</td>
              {isAdmin && (
                <td>
                  {member.userId !== currentUserId && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => onRemove?.(member.userId)}
                      aria-label={`Remover ${member.name}`}
                    >
                      Remover
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
