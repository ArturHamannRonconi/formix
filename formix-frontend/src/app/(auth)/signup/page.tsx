'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/services/auth/auth.service';
import { ApiError } from '@/types/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!form.name.trim()) return 'Nome é obrigatório';
    if (!form.email.trim()) return 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido';
    if (form.password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    if (!/[0-9]/.test(form.password) || !/[a-zA-Z]/.test(form.password))
      return 'Senha deve conter letras e números';
    if (form.password !== form.confirmPassword) return 'As senhas não coincidem';
    if (!form.organizationName.trim()) return 'Nome da organização é obrigatório';
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
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        organizationName: form.organizationName,
      });
      router.push('/confirm-email');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError('Email já cadastrado');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>Preencha os dados para começar</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              disabled={loading}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
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
              value={form.password}
              onChange={handleChange('password')}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName">Nome da organização</Label>
            <Input
              id="organizationName"
              type="text"
              value={form.organizationName}
              onChange={handleChange('organizationName')}
              disabled={loading}
              placeholder="Minha Empresa"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        <p>
          Já tem uma conta?{' '}
          <Link href="/login" className="text-violet-600 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
