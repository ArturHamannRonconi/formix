'use client';

import { AppShell } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <AppShell
      orgName={user?.organizationId ? 'Organização' : undefined}
      userName={user?.name}
      onLogout={logout}
    >
      {children}
    </AppShell>
  );
}
