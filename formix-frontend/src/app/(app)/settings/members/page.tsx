'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/Layout';
import { MembersTable } from '@/modules/MembersTable/MembersTable';
import { listMembers } from '@/services/organizations/organizations.service';
import { useAuth } from '@/hooks/useAuth';
import type { Member } from '@/services/organizations/organizations.types';

export default function MembersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listMembers(user.organizationId)
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <PageContainer>
        <p>Carregando membros...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Membros</h1>
        {user?.role === 'admin' && (
          <button disabled style={{ opacity: 0.5 }}>
            Convidar membro
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <p>Nenhum membro encontrado.</p>
      ) : (
        <MembersTable
          members={members}
          currentUserId={user?.id ?? ''}
          isAdmin={user?.role === 'admin'}
        />
      )}
    </PageContainer>
  );
}
