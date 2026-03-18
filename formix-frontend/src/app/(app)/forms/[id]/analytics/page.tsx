import { PageContainer } from '@/components/Layout';

interface FormAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormAnalyticsPage({ params }: FormAnalyticsPageProps) {
  const { id } = await params;
  return (
    <PageContainer>
      <h1>Analytics</h1>
      <p>ID: {id} — Conteúdo em breve (US-044).</p>
    </PageContainer>
  );
}
