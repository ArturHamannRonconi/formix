import { PageContainer } from '@/components/Layout';

interface PublicFormPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <h1>Formulário público</h1>
      <p>Token: {id} — Conteúdo em breve (US-040).</p>
    </PageContainer>
  );
}
