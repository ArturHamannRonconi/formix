import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';

export default function CheckEmailPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-violet-100 p-4">
            <MailCheck className="size-8 text-violet-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Verifique seu email</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Não recebeu? Verifique a pasta de spam ou solicite um novo link.
        </p>
      </CardContent>

      <CardFooter className="justify-center">
        <Link href="/login" className="text-violet-600 hover:underline text-sm font-medium">
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  );
}
