'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/Layout';
import { MembersTable } from '@/modules/MembersTable/MembersTable';
import { RemoveMemberModal } from '@/modules/MembersTable/RemoveMemberModal';
import { listMembers, removeMember } from '@/services/organizations/organizations.service';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api-error';
import type { Member } from '@/services/organizations/organizations.types';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function MembersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function fetchMembers() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listMembers(user.organizationId);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleRemoveConfirm() {
    if (!memberToRemove || !user) return;
    setRemoveLoading(true);
    try {
      await removeMember(user.organizationId, memberToRemove.userId);
      setMemberToRemove(null);
      showToast('success', `${memberToRemove.name} foi removido da organização.`);
      await fetchMembers();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        showToast('error', 'Não é possível remover o único admin da organização.');
      } else {
        showToast('error', 'Erro ao remover membro.');
      }
    } finally {
      setRemoveLoading(false);
    }
  }

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

      {toast && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            marginBottom: 24,
            borderRadius: 6,
            background: toast.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: toast.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${toast.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
          }}
        >
          {toast.message}
        </div>
      )}

      {members.length === 0 ? (
        <p>Nenhum membro encontrado.</p>
      ) : (
        <MembersTable
          members={members}
          currentUserId={user?.id ?? ''}
          isAdmin={user?.role === 'admin'}
          onRemove={(userId) => {
            const member = members.find((m) => m.userId === userId);
            if (member) setMemberToRemove(member);
          }}
        />
      )}

      {memberToRemove && (
        <RemoveMemberModal
          memberName={memberToRemove.name}
          loading={removeLoading}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setMemberToRemove(null)}
        />
      )}
    </PageContainer>
  );
}
