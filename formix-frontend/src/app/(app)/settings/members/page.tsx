'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/Layout';
import { MembersTable } from '@/modules/MembersTable/MembersTable';
import { RemoveMemberModal } from '@/modules/MembersTable/RemoveMemberModal';
import { InvitationsSection } from '@/modules/InvitationsSection/InvitationsSection';
import { listMembers, removeMember } from '@/services/organizations/organizations.service';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api-error';
import { Skeleton } from '@/components/ui/skeleton';
import type { Member } from '@/services/organizations/organizations.types';

export default function MembersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

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
      toast.success(`${memberToRemove.name} foi removido da organização.`);
      await fetchMembers();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        toast.error('Não é possível remover o único admin da organização.');
      } else {
        toast.error('Erro ao remover membro.');
      }
    } finally {
      setRemoveLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Membros</h1>
      </div>

      {members.length === 0 ? (
        <p className="text-muted-foreground">Nenhum membro encontrado.</p>
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

      <InvitationsSection isAdmin={user?.role === 'admin'} />
    </PageContainer>
  );
}
