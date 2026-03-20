'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ArrowUpDown, Search, X } from 'lucide-react';
import { PageContainer } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getForm } from '@/services/forms/forms.service';
import { listResponses } from '@/services/responses/responses.service';
import type { FormDetail } from '@/services/forms/forms.types';
import type { ListResponsesOutput } from '@/services/responses/responses.types';

const PAGE_SIZE = 20;

type SortDirection = 'asc' | 'desc';

interface SortState {
  column: string;
  direction: SortDirection;
}

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

function SortIcon({ column, sort }: { column: string; sort: SortState }) {
  if (sort.column !== column) return <ArrowUpDown className="size-3.5 ml-1 shrink-0 text-muted-foreground/50" />;
  if (sort.direction === 'asc') return <ArrowUp className="size-3.5 ml-1 shrink-0 text-violet-600" />;
  return <ArrowDown className="size-3.5 ml-1 shrink-0 text-violet-600" />;
}

export default function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [data, setData] = useState<ListResponsesOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<SortState>({ column: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (params: { page: number; search: string; sort: SortState; form: FormDetail | null }) => {
      setLoading(true);
      try {
        const offset = (params.page - 1) * PAGE_SIZE;
        const [formData, responsesData] = await Promise.all([
          params.form ? Promise.resolve(params.form) : getForm(id),
          listResponses(id, offset, PAGE_SIZE, params.search || undefined, params.sort.column, params.sort.direction),
        ]);
        setForm(formData);
        setData(responsesData);
      } catch {
        setError('Erro ao carregar respostas.');
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    load({ page: 1, search: '', sort: { column: 'date', direction: 'desc' }, form: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchInput(val: string) {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
      load({ page: 1, search: val, sort, form });
    }, 400);
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearch('');
    setPage(1);
    load({ page: 1, search: '', sort, form });
  }

  function handleSort(column: string) {
    const newSort: SortState = sort.column === column
      ? { column, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
      : { column, direction: 'asc' };
    setSort(newSort);
    setPage(1);
    load({ page: 1, search, sort: newSort, form });
  }

  function handlePage(newPage: number) {
    setPage(newPage);
    load({ page: newPage, search, sort, form });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const orderedQuestions = form?.questions.slice().sort((a, b) => a.order - b.order) ?? [];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{form?.title ?? 'Respostas'}</h1>
            {data && (
              <p className="text-sm text-muted-foreground">
                {data.total} {data.total === 1 ? 'resposta' : 'respostas'}
                {search && <span className="ml-1">encontrada{data.total !== 1 ? 's' : ''} para &quot;{search}&quot;</span>}
              </p>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link href="/forms">Voltar</Link>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Buscar em qualquer coluna..."
            className="pl-9 pr-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : data?.responses.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              {search ? `Nenhuma resposta encontrada para "${search}".` : 'Nenhuma resposta recebida ainda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('date')}
                      className="flex items-center hover:text-violet-600 transition-colors"
                    >
                      Data
                      <SortIcon column="date" sort={sort} />
                    </button>
                  </th>
                  {orderedQuestions.map((q) => (
                    <th
                      key={q.id}
                      className="whitespace-nowrap px-4 py-3 text-left font-medium max-w-[200px]"
                    >
                      <button
                        type="button"
                        onClick={() => handleSort(q.id)}
                        className="flex items-center hover:text-violet-600 transition-colors"
                      >
                        <span className="truncate max-w-[160px]">{q.label}</span>
                        <SortIcon column={q.id} sort={sort} />
                      </button>
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
                    {orderedQuestions.map((q) => (
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

        {data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => handlePage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading}
                onClick={() => handlePage(page + 1)}
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
