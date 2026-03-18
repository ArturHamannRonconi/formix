interface RoleBadgeProps {
  role: 'admin' | 'member';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === 'admin';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: isAdmin ? '#dbeafe' : '#f3f4f6',
        color: isAdmin ? '#1d4ed8' : '#6b7280',
        border: `1px solid ${isAdmin ? '#bfdbfe' : '#e5e7eb'}`,
      }}
    >
      {isAdmin ? 'Admin' : 'Membro'}
    </span>
  );
}
