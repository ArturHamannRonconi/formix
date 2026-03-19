'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InviteModalProps {
  loading: boolean;
  onConfirm: (email: string) => void;
  onCancel: () => void;
}

export function InviteModal({ loading, onConfirm, onCancel }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  function validateEmail(value: string): boolean {
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Email inválido');
      return false;
    }
    setEmailError('');
    return true;
  }

  function handleSubmit() {
    if (!validateEmail(email)) return;
    onConfirm(email);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            Informe o email da pessoa que você deseja convidar para a organização.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="usuario@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            disabled={loading}
            aria-describedby={emailError ? 'invite-email-error' : undefined}
          />
          {emailError && (
            <p id="invite-email-error" className="text-sm text-destructive">{emailError}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !email}>
            {loading ? 'Enviando...' : 'Enviar convite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
