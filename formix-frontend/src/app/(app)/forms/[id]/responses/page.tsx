'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { getForm } from '@/services/forms/forms.service';
import { listResponses } from '@/services/responses/responses.service';
import type { FormDetail } from '@/services/forms/forms.types';
import type { ListResponsesOutput } from '@/services/responses/responses.types';

const DEFAULT_LIMIT = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getAnswerValue(answers: { questionId: string; value: unknown }[], questionId: string): string {
  const answer = answers.find((a) => a.questionId === questionId);
  if (answer === undefined || answer.value === null || answer.value === undefined) return '—';
  if (Array.isArray(answer.value)) return answer.value.join(', ');
  return String(answer.value);
}

export default function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [data, setData] = useState<ListResponsesOutput | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (newOffset: number) => {
      setLoading(true);
      try {
        const [formData, responsesData] = await Promise.all([
          form ? Promise.resolve(form) : getForm(id),
          listResponses(id, newOffset, DEFAULT_LIMIT),
        ]);
        setForm(formData);
        setData(responsesData);
        setOffset(newOffset);
      } catch {
        setError('Erro ao carregar respostas.');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const totalPages = data ? Math.ceil(data.total / DEFAULT_LIMIT) : 0;
  const currentPage = Math.floor(offset / DEFAULT_LIMIT) + 1;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{form?.title ?? 'Respostas'}</h1>
            {data && (
              <p className="text-sm text-muted-foreground">
                {data.total} {data.total === 1 ? 'resposta' : 'respostas'} no total
              </p>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link href="/forms">Voltar</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : data?.responses.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">Nenhuma resposta recebida ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Data</th>
                  {form?.questions
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((q) => (
                      <th
                        key={q.id}
                        className="whitespace-nowrap px-4 py-3 text-left font-medium max-w-[200px]"
                      >
                        {q.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.responses.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(row.submittedAt)}
                    </td>
                    {form?.questions
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((q) => (
                        <td
                          key={q.id}
                          className="px-4 py-3 max-w-[200px] truncate"
                          title={getAnswerValue(row.answers, q.id)}
                        >
                          {getAnswerValue(row.answers, q.id)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => load(Math.max(0, offset - DEFAULT_LIMIT))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + DEFAULT_LIMIT >= (data?.total ?? 0)}
                onClick={() => load(offset + DEFAULT_LIMIT)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
