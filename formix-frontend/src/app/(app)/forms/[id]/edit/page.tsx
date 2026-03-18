import { PageContainer } from '@/components/Layout';

interface EditFormPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params;
  return (
    <PageContainer>
      <h1>Editar Formulário</h1>
      <p>ID: {id} — Conteúdo em breve (US-035).</p>
    </PageContainer>
  );
}
