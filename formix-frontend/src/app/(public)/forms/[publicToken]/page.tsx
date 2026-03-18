import { PageContainer } from '@/components/Layout';

interface PublicFormPageProps {
  params: Promise<{ publicToken: string }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { publicToken } = await params;

  return (
    <PageContainer>
      <h1>Formulário público</h1>
      <p>Token: {publicToken} — Conteúdo em breve (US-040).</p>
    </PageContainer>
  );
}
