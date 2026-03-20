'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Save, Globe, X, Settings, ChevronDown, ChevronUp, Link2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { QuestionList } from './QuestionList';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { FormSettings } from './FormSettings';
import type { QuestionType } from '@/services/forms/forms.types';

interface FormBuilderProps {
  formId?: string;
}

export function FormBuilder({ formId }: FormBuilderProps) {
  const router = useRouter();
  const {
    formId: currentFormId,
    formData,
    setFormData,
    questions,
    isDirty,
    isLoading,
    publicToken,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    saveForm,
    publishForm,
    expireForm,
  } = useFormBuilder(formId);

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const savedId = await saveForm();
      toast.success('Formulário salvo com sucesso.');
      if (!formId && savedId) {
        router.replace(`/forms/${savedId}/edit`);
      }
    } catch {
      toast.error('Erro ao salvar formulário.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    setIsPublishing(true);
    try {
      const result = await publishForm();
      const url = `${window.location.origin}/f/${result.publicToken}`;
      toast.success('Formulário publicado! Link copiado para a área de transferência.');
      navigator.clipboard.writeText(url).catch(() => {});
    } catch {
      toast.error('Erro ao publicar formulário.');
    } finally {
      setIsPublishing(false);
    }
  }

  function handleCopyLink() {
    if (!publicToken) return;
    const url = `${window.location.origin}/f/${publicToken}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiado!');
    }).catch(() => {
      toast.error('Erro ao copiar link.');
    });
  }

  async function handleExpire() {
    setIsExpiring(true);
    try {
      await expireForm();
      toast.success('Formulário despublicado e respostas excluídas.');
    } catch {
      toast.error('Erro ao expirar formulário.');
    } finally {
      setIsExpiring(false);
    }
  }

  async function handleSelectType(type: QuestionType) {
    setIsAddingQuestion(true);
    try {
      const { formId: savedFormId } = await addQuestion(type);
      if (!formId && savedFormId) {
        router.replace(`/forms/${savedFormId}/edit`);
      }
    } catch {
      toast.error('Erro ao adicionar pergunta.');
    } finally {
      setIsAddingQuestion(false);
    }
  }

  async function handleUpdateQuestion(id: string, data: Parameters<typeof updateQuestion>[1]) {
    try {
      await updateQuestion(id, data);
    } catch {
      toast.error('Erro ao atualizar pergunta.');
    }
  }

  async function handleRemoveQuestion(id: string) {
    try {
      await removeQuestion(id);
      toast.success('Pergunta removida.');
    } catch {
      toast.error('Erro ao remover pergunta.');
    }
  }

  async function handleReorder(newQuestions: Parameters<typeof reorderQuestions>[0]) {
    try {
      await reorderQuestions(newQuestions);
    } catch {
      toast.error('Erro ao reordenar perguntas.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Carregando formulário...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ title: e.target.value })}
            placeholder="Título do formulário"
            className="text-xl font-semibold border-0 border-b border-slate-200 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-violet-500 text-slate-900 dark:text-slate-100"
          />
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            placeholder="Descrição (opcional)"
            className="border-0 border-b border-slate-200 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-violet-500 text-slate-600 dark:text-slate-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || (!isDirty && !!currentFormId)}
          >
            <Save className="size-4 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Salvar rascunho'}
          </Button>

          {currentFormId ? (
            publicToken ? (
              <Button
                size="sm"
                onClick={handleExpire}
                disabled={isExpiring}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                variant="outline"
              >
                <X className="size-4 mr-1.5" />
                {isExpiring ? 'Encerrando...' : 'Encerrar'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Globe className="size-4 mr-1.5" />
                {isPublishing ? 'Publicando...' : 'Publicar'}
              </Button>
            )
          ) : null}
        </div>
      </div>

      {publicToken && (
        <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg text-sm">
          <Link2 className="size-4 text-violet-500 dark:text-violet-400 shrink-0" />
          <span className="text-violet-700 dark:text-violet-300 font-medium truncate flex-1">
            {`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${publicToken}`}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200 shrink-0"
          >
            <Copy className="size-3.5" />
            Copiar
          </button>
        </div>
      )}

      <Separator />

      {/* Questions */}
      <div className="space-y-4">
        <QuestionList
          questions={questions}
          onUpdate={handleUpdateQuestion}
          onRemove={handleRemoveQuestion}
          onReorder={handleReorder}
        />

        <Button
          variant="outline"
          onClick={() => setShowTypeSelector(true)}
          disabled={isAddingQuestion}
          className="w-full border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/30 dark:hover:text-violet-300"
        >
          <Plus className="size-4 mr-2" />
          {isAddingQuestion ? 'Adicionando...' : 'Adicionar pergunta'}
        </Button>
      </div>

      <Separator />

      {/* Settings collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
        >
          <Settings className="size-4" />
          Configurações do formulário
          {showSettings ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>

        {showSettings && (
          <div className="mt-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <FormSettings
              settings={formData.settings}
              onChange={(partial) =>
                setFormData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, ...partial },
                }))
              }
            />
          </div>
        )}
      </div>

      {/* Question Type Selector Modal */}
      {showTypeSelector && (
        <QuestionTypeSelector
          onSelect={handleSelectType}
          onClose={() => setShowTypeSelector(false)}
        />
      )}
    </div>
  );
}
