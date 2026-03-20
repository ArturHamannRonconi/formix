'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/Layout';
import { TextInput } from '@/components/inputs/TextInput';
import { getProfile, updateProfile } from '@/services/users/users.service';
import { ApiError } from '@/types/api-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/services/users/users.types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
      setName(data.name);
    });
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    try {
      await updateProfile({ name: name.trim() });
      setProfile((prev) => prev ? { ...prev, name: name.trim() } : prev);
      toast.success('Nome atualizado com sucesso.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar nome.';
      toast.error(message);
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
      toast.success('Senha alterada com sucesso.');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        toast.error('Senha atual incorreta.');
      } else {
        toast.error('Erro ao alterar senha.');
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Perfil</h1>

      <div className="space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
            <CardDescription>Atualize seu nome de exibição</CardDescription>
          </CardHeader>
          <CardContent>
            {!profile ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-24" />
              </div>
            ) : (
              <form onSubmit={handleSaveName} noValidate className="space-y-4">
                <TextInput
                  label="Nome"
                  value={name}
                  onChange={setName}
                  required
                  disabled={nameLoading}
                />
                <TextInput
                  label="Email"
                  value={profile.email ?? ''}
                  onChange={() => {}}
                  disabled
                />
                <Button type="submit" disabled={nameLoading} className="bg-violet-600 hover:bg-violet-700">
                  {nameLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>Crie uma nova senha segura</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} noValidate className="space-y-4">
              <TextInput
                label="Senha atual"
                value={currentPassword}
                onChange={setCurrentPassword}
                type="password"
                required
                disabled={passwordLoading}
              />
              <TextInput
                label="Nova senha"
                value={newPassword}
                onChange={setNewPassword}
                type="password"
                required
                disabled={passwordLoading}
              />
              <TextInput
                label="Confirmar nova senha"
                value={confirmPassword}
                onChange={setConfirmPassword}
                type="password"
                required
                disabled={passwordLoading}
                error={passwordError ?? undefined}
              />
              <Button type="submit" disabled={passwordLoading} className="bg-violet-600 hover:bg-violet-700">
                {passwordLoading ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
