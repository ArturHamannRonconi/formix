'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InviteModal } from './InviteModal';
import {
  listInvitations,
  createInvitation,
  resendInvitation,
  cancelInvitation,
} from '@/services/invitations/invitations.service';
import type { Invitation } from '@/services/invitations/invitations.types';
import { ApiError } from '@/types/api-error';

interface InvitationsSectionProps {
  isAdmin: boolean;
}

export function InvitationsSection({ isAdmin }: InvitationsSectionProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInvitations();
      setInvitations(data.filter((inv) => inv.status === 'pending'));
    } catch {
      toast.error('Erro ao carregar convites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchInvitations();
    }
  }, [isAdmin, fetchInvitations]);

  async function handleInvite(email: string) {
    setInviteLoading(true);
    try {
      await createInvitation(email);
      toast.success(`Convite enviado para ${email}.`);
      setShowInviteModal(false);
      await fetchInvitations();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        toast.error('Já existe um convite pendente ou o usuário já é membro.');
      } else {
        toast.error('Erro ao enviar convite.');
      }
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleResend(invitationId: string, email: string) {
    setActionLoadingId(invitationId);
    try {
      await resendInvitation(invitationId);
      toast.success(`Convite reenviado para ${email}.`);
      await fetchInvitations();
    } catch {
      toast.error('Erro ao reenviar convite.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCancel(invitationId: string) {
    setActionLoadingId(invitationId);
    try {
      await cancelInvitation(invitationId);
      toast.success('Convite cancelado.');
      setCancelConfirmId(null);
      await fetchInvitations();
    } catch {
      toast.error('Erro ao cancelar convite.');
    } finally {
      setActionLoadingId(null);
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Convites pendentes</h2>
        <Button onClick={() => setShowInviteModal(true)}>Convidar membro</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando convites...</p>
      ) : invitations.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum convite pendente.</p>
      ) : (
        <div className="border rounded-md divide-y">
          {invitations.map((inv) => {
            const isActing = actionLoadingId === inv.id;
            const isCancelConfirm = cancelConfirmId === inv.id;
            return (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Expira em {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isCancelConfirm ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isActing}
                        onClick={() => handleCancel(inv.id)}
                      >
                        {isActing ? 'Cancelando...' : 'Confirmar cancelamento'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActing}
                        onClick={() => setCancelConfirmId(null)}
                      >
                        Voltar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActing}
                        onClick={() => handleResend(inv.id, inv.email)}
                      >
                        {isActing ? 'Reenviando...' : 'Reenviar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isActing}
                        onClick={() => setCancelConfirmId(inv.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showInviteModal && (
        <InviteModal
          loading={inviteLoading}
          onConfirm={handleInvite}
          onCancel={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
