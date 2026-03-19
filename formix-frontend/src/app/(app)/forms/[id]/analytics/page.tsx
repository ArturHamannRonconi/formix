'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dashboard } from '@/modules/Dashboard/Dashboard';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFormBuilder } from '@/hooks/useFormBuilder';

export default function FormAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const { data, isLoading, error } = useAnalytics(id, groupBy);
  const { questions } = useFormBuilder(id);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <Button variant="outline" asChild>
            <Link href={`/forms/${id}`}>Voltar</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : data && data.totalResponses === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Nenhuma resposta recebida ainda.</p>
          </div>
        ) : data ? (
          <Dashboard
            analytics={data}
            questions={questions}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
