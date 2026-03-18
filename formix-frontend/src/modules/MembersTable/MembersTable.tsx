import type { Member } from '@/services/organizations/organizations.types';
import { RoleBadge } from './RoleBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MembersTableProps {
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  onRemove?: (userId: string) => void;
}

export function MembersTable({ members, currentUserId, isAdmin, onRemove }: MembersTableProps) {
  return (
    <div className="rounded-md border">
      <Table aria-label="Lista de membros">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Entrou em</TableHead>
            {isAdmin && <TableHead className="w-24">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.userId}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell className="text-muted-foreground">{member.email}</TableCell>
              <TableCell>
                <RoleBadge role={member.role} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  {member.userId !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onRemove?.(member.userId)}
                      aria-label={`Remover ${member.name}`}
                    >
                      Remover
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
