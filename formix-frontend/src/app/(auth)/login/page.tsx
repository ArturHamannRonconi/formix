'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/services/auth/auth.service';
import { setAccessToken, setRefreshToken } from '@/services/auth-token';
import { ApiError } from '@/types/api-error';

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
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href="/forgot-password">Esqueci a senha</Link>
      </p>
    </main>
  );
}
