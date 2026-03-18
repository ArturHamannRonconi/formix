'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/services/auth/auth.service';
import { ApiError } from '@/types/api-error';

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
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="confirmPassword">Confirmar senha</label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="organizationName">Nome da organização</label>
          <input
            id="organizationName"
            type="text"
            value={form.organizationName}
            onChange={handleChange('organizationName')}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </main>
  );
}
