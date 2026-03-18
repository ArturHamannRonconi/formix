'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { confirmEmail, resendConfirmation } from '@/services/auth/auth.service';

type Status = 'no-token' | 'loading' | 'success' | 'error';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'no-token');
  const [resendEmail, setResendEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [showResendForm, setShowResendForm] = useState(false);

  useEffect(() => {
    if (!token) return;

    confirmEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/login'), 3000);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendState('loading');
    try {
      await resendConfirmation(resendEmail);
      setResendState('sent');
    } catch {
      setResendState('sent'); // always show sent (silent endpoint)
    }
  }

  if (status === 'loading') {
    return <p>Confirmando seu email...</p>;
  }

  if (status === 'success') {
    return (
      <>
        <p>Email confirmado com sucesso! Redirecionando para o login...</p>
        <Link href="/login">Ir para o login agora</Link>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <p style={{ color: 'red' }}>Token inválido ou expirado.</p>
        <button onClick={() => setShowResendForm(true)}>Reenviar email de confirmação</button>
        {showResendForm && <ResendForm email={resendEmail} onChange={setResendEmail} onSubmit={handleResend} state={resendState} />}
      </>
    );
  }

  // no-token
  return (
    <>
      <p>Verifique seu email e clique no link enviado para confirmar sua conta.</p>
      <button onClick={() => setShowResendForm((v) => !v)}>Reenviar email</button>
      {showResendForm && <ResendForm email={resendEmail} onChange={setResendEmail} onSubmit={handleResend} state={resendState} />}
    </>
  );
}

interface ResendFormProps {
  email: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  state: 'idle' | 'loading' | 'sent';
}

function ResendForm({ email, onChange, onSubmit, state }: ResendFormProps) {
  if (state === 'sent') {
    return <p>Se o email estiver cadastrado, você receberá o link em breve.</p>;
  }
  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
      <input
        type="email"
        placeholder="Seu email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={state === 'loading'}
        style={{ marginRight: 8 }}
      />
      <button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
}

export default function ConfirmEmailPage() {
  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Confirmação de email</h1>
      <Suspense fallback={<p>Carregando...</p>}>
        <ConfirmEmailContent />
      </Suspense>
    </main>
  );
}
