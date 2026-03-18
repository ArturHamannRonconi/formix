'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/services/auth/auth.service';
import { ApiError } from '@/types/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Senha redefinida com sucesso! Redirecionando para o login...
        </p>
        <Link href="/login" className="text-violet-600 hover:underline text-sm font-medium">
          Ir para o login agora
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}{' '}
          {(error.includes('inválido') || error.includes('expirado')) && (
            <Link href="/forgot-password" className="underline">
              Solicitar novo link
            </Link>
          )}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
        {loading ? 'Redefinindo...' : 'Redefinir senha'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
        <CardTitle className="text-2xl">Redefinir senha</CardTitle>
        <CardDescription>Crie uma nova senha para sua conta</CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando...</p>}>
          <ResetPasswordContent />
        </Suspense>
      </CardContent>

      <CardFooter className="justify-center text-sm">
        <Link href="/login" className="text-violet-600 hover:underline">
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  );
}
