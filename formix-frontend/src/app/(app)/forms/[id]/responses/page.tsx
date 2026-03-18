import { PageContainer } from '@/components/Layout';

interface FormResponsesPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormResponsesPage({ params }: FormResponsesPageProps) {
  const { id } = await params;
  return (
    <PageContainer>
      <h1>Respostas</h1>
      <p>ID: {id} — Conteúdo em breve (US-042).</p>
    </PageContainer>
  );
}
