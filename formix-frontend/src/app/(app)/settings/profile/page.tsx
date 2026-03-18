'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/Layout';
import { TextInput } from '@/components/inputs/TextInput';
import { getProfile, updateProfile } from '@/services/users/users.service';
import { ApiError } from '@/types/api-error';
import type { UserProfile } from '@/services/users/users.types';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
      setName(data.name);
    });
  }, []);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    try {
      await updateProfile({ name: name.trim() });
      setProfile((prev) => prev ? { ...prev, name: name.trim() } : prev);
      showToast('success', 'Nome atualizado com sucesso.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar nome.';
      showToast('error', message);
    } finally {
      setNameLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem.');
      return;
    }
    setPasswordLoading(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', 'Senha alterada com sucesso.');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        showToast('error', 'Senha atual incorreta.');
      } else {
        showToast('error', 'Erro ao alterar senha.');
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <PageContainer>
      <h1>Perfil</h1>

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

      <section style={{ marginBottom: 40, maxWidth: 480 }}>
        <h2>Dados pessoais</h2>
        <form onSubmit={handleSaveName} noValidate>
          <div style={{ marginBottom: 16 }}>
            <TextInput
              label="Nome"
              value={name}
              onChange={setName}
              required
              disabled={nameLoading || !profile}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <TextInput
              label="Email"
              value={profile?.email ?? ''}
              onChange={() => {}}
              disabled
            />
          </div>
          <button type="submit" disabled={nameLoading || !profile}>
            {nameLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </section>

      <section style={{ maxWidth: 480 }}>
        <h2>Alterar senha</h2>
        <form onSubmit={handleChangePassword} noValidate>
          <div style={{ marginBottom: 16 }}>
            <TextInput
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              type="password"
              required
              disabled={passwordLoading}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <TextInput
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              type="password"
              required
              disabled={passwordLoading}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <TextInput
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
              required
              disabled={passwordLoading}
              error={passwordError ?? undefined}
            />
          </div>
          <button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </section>
    </PageContainer>
  );
}
