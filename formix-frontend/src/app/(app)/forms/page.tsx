'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { PageContainer } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { FormCard } from '@/modules/FormCard/FormCard';
import { listForms, deleteForm } from '@/services/forms/forms.service';
import type { FormSummary, FormStatus } from '@/services/forms/forms.types';

const statusOptions: { label: string; value: '' | FormStatus }[] = [
  { label: 'Todos', value: '' },
  { label: 'Rascunho', value: 'draft' },
  { label: 'Ativo', value: 'active' },
  { label: 'Expirado', value: 'expired' },
  { label: 'Encerrado', value: 'closed' },
];

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | FormStatus>('');

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listForms(statusFilter || undefined);
      setForms(data);
    } catch {
      toast.error('Erro ao carregar formulários.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  async function handleDelete(id: string) {
    try {
      await deleteForm(id);
      toast.success('Formulário excluído com sucesso.');
      await fetchForms();
    } catch {
      toast.error('Erro ao excluir formulário.');
    }
  }

  function handleCreate() {
    router.push('/forms/new');
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Formulários</h1>
        <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
          Criar formulário
        </Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === option.value
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card shadow-sm h-48 animate-pulse bg-slate-100"
            />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-violet-100 p-5 mb-4">
            <FileText className="size-10 text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            {statusFilter ? 'Nenhum formulário encontrado' : 'Nenhum formulário ainda'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            {statusFilter
              ? 'Tente selecionar outro filtro de status.'
              : 'Crie seu primeiro formulário e comece a coletar respostas da sua equipe.'}
          </p>
          {!statusFilter && (
            <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
              Criar formulário
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
