'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/services/auth/auth.service';
import { ApiError } from '@/types/api-error';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/forgot-password');
    }
  }, [token, router]);

  if (!token) return null;

  function validate(): string | null {
    if (newPassword.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    if (!/[0-9]/.test(newPassword) || !/[a-zA-Z]/.test(newPassword))
      return 'Senha deve conter letras e números';
    if (newPassword !== confirmPassword) return 'As senhas não coincidem';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token!, newPassword);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 410)) {
        setError('Link inválido ou expirado.');
      } else {
        setError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <p>Senha redefinida com sucesso! Redirecionando para o login...</p>
        <Link href="/login">Ir para o login agora</Link>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="newPassword">Nova senha</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="confirmPassword">Confirmar nova senha</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </div>
      {error && (
        <p style={{ color: 'red', marginBottom: 16 }}>
          {error}{' '}
          {(error.includes('inválido') || error.includes('expirado')) && (
            <Link href="/forgot-password">Solicitar novo link</Link>
          )}
        </p>
      )}
      <button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Redefinindo...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Redefinir senha</h1>
      <Suspense fallback={<p>Carregando...</p>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
