import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: 'admin' | 'member';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === 'admin';
  return (
    <Badge variant={isAdmin ? 'default' : 'secondary'}>
      {isAdmin ? 'Admin' : 'Membro'}
    </Badge>
  );
}
