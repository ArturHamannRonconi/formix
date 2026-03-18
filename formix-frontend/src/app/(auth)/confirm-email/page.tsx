'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { confirmEmail, resendConfirmation } from '@/services/auth/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

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
    return <p className="text-center text-sm text-muted-foreground">Confirmando seu email...</p>;
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <CheckCircle className="size-12 text-green-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          Email confirmado com sucesso! Redirecionando para o login...
        </p>
        <Link href="/login" className="text-violet-600 hover:underline text-sm font-medium">
          Ir para o login agora
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <XCircle className="size-12 text-destructive" />
        </div>
        <p className="text-center text-sm text-destructive">Token inválido ou expirado.</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowResendForm(true)}
        >
          Reenviar email de confirmação
        </Button>
        {showResendForm && (
          <ResendForm email={resendEmail} onChange={setResendEmail} onSubmit={handleResend} state={resendState} />
        )}
      </div>
    );
  }

  // no-token
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Mail className="size-12 text-violet-500" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Verifique seu email e clique no link enviado para confirmar sua conta.
      </p>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowResendForm((v) => !v)}
      >
        Reenviar email
      </Button>
      {showResendForm && (
        <ResendForm email={resendEmail} onChange={setResendEmail} onSubmit={handleResend} state={resendState} />
      )}
    </div>
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
    return (
      <p className="text-sm text-muted-foreground text-center">
        Se o email estiver cadastrado, você receberá o link em breve.
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="resend-email">Seu email</Label>
        <Input
          id="resend-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={state === 'loading'}
        />
      </div>
      <Button type="submit" disabled={state === 'loading'} className="w-full bg-violet-600 hover:bg-violet-700">
        {state === 'loading' ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
        <CardTitle className="text-2xl">Confirmação de email</CardTitle>
        <CardDescription>Verificando sua conta</CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando...</p>}>
          <ConfirmEmailContent />
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
