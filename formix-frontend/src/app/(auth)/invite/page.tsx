'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { acceptInvitation } from '@/services/invitations/invitations.service';
import { setAccessToken, setRefreshToken } from '@/services/auth-token';
import { ApiError } from '@/types/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type PageState = 'loading' | 'error' | 'existing-user' | 'new-user' | 'needs-credentials';

function InvitePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMessage('Link de convite inválido ou expirado.');
      setPageState('error');
      return;
    }

    // Try accepting as existing user (no name/password)
    async function tryAcceptAsExistingUser() {
      try {
        const result = await acceptInvitation(token!);
        setAccessToken(result.accessToken);
        setRefreshToken(result.refreshToken);
        router.push('/forms');
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.statusCode === 400 && err.message?.includes('Name and password are required')) {
            setPageState('new-user');
          } else if (err.statusCode === 400) {
            setErrorMessage('Este convite é inválido ou já expirou.');
            setPageState('error');
          } else {
            // Could be existing user scenario where token is valid
            setPageState('existing-user');
          }
        } else {
          setPageState('existing-user');
        }
      }
    }

    tryAcceptAsExistingUser();
  }, [token, router]);

  async function handleAccept() {
    if (!token) return;
    setLoading(true);
    setFormError('');
    try {
      const result = await acceptInvitation(token);
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      router.push('/forms');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400 && err.message?.includes('Name and password are required')) {
          setPageState('new-user');
        } else if (err.statusCode === 400) {
          setErrorMessage('Este convite é inválido ou já expirou.');
          setPageState('error');
        } else {
          setFormError('Erro ao aceitar convite. Tente novamente.');
        }
      } else {
        setFormError('Erro ao aceitar convite. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNewUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setFormError('');

    if (!name.trim()) {
      setFormError('Nome é obrigatório.');
      return;
    }
    if (password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvitation(token, { name: name.trim(), password });
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      router.push('/forms');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 400) {
        setFormError('Convite inválido ou expirado.');
      } else {
        setFormError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (pageState === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-8 text-center text-muted-foreground">
          Verificando convite...
        </CardContent>
      </Card>
    );
  }

  if (pageState === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
          <CardTitle className="text-2xl">Convite inválido</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-violet-600 hover:underline text-sm">
            Ir para o login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (pageState === 'new-user') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
          <CardTitle className="text-2xl">Criar conta e entrar</CardTitle>
          <CardDescription>Preencha seus dados para aceitar o convite.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleNewUserSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Seu nome"
                autoComplete="name"
                aria-required="true"
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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Repita a senha"
                autoComplete="new-password"
                aria-required="true"
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive" role="alert">{formError}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
              {loading ? 'Criando conta...' : 'Criar conta e entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // existing-user state
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
        <CardTitle className="text-2xl">Você foi convidado!</CardTitle>
        <CardDescription>Clique no botão abaixo para aceitar o convite e entrar na organização.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {formError && (
          <p className="text-sm text-destructive" role="alert">{formError}</p>
        )}
        <Button
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {loading ? 'Aceitando...' : 'Aceitar convite'}
        </Button>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        <p>
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={() => setPageState('new-user')}
            className="text-violet-600 hover:underline font-medium"
          >
            Criar conta
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md">
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
