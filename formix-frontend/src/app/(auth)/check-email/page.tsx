import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <main style={{ maxWidth: 400, padding: '0 16px', textAlign: 'center' }}>
      <h1>Verifique seu email</h1>
      <p>Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada.</p>
      <p style={{ marginTop: 24 }}>
        <Link href="/login">Voltar para o login</Link>
      </p>
    </main>
  );
}
