'use client';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-slate-100 text-slate-700',
  },
  active: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-700',
  },
  expired: {
    label: 'Expirado',
    className: 'bg-amber-100 text-amber-700',
  },
  closed: {
    label: 'Encerrado',
    className: 'bg-red-100 text-red-700',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
