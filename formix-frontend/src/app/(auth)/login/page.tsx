'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/services/auth/auth.service';
import { setAccessToken, setRefreshToken } from '@/services/auth-token';
import { ApiError } from '@/types/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
    if (!password) return 'Senha é obrigatória';
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
      const response = await login(email, password);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      router.push('/forms');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 403) {
          setError('Confirme seu email antes de fazer login.');
        } else if (err.statusCode === 401) {
          setError('Email ou senha incorretos.');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>Acesse sua conta para continuar</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-violet-600 hover:underline">
          Esqueci a senha
        </Link>
        <p>
          Não tem uma conta?{' '}
          <Link href="/signup" className="text-violet-600 hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
