'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/services/auth/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      // always show the same message (silent endpoint)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-violet-600">Formix</div>
        <CardTitle className="text-2xl">Recuperar senha</CardTitle>
        <CardDescription>
          {submitted
            ? 'Verifique seu email'
            : 'Informe seu email para receber o link de recuperação'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <p className="text-center text-sm text-muted-foreground">
            Se o email existir, você receberá um link em breve.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700">
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center text-sm">
        <Link href="/login" className="text-violet-600 hover:underline">
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  );
}
