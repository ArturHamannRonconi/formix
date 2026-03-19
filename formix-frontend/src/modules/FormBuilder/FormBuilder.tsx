'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Save, Globe, X, Settings, ChevronDown, ChevronUp } from 'lucide-react';
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
  const {
    formData,
    setFormData,
    questions,
    isDirty,
    isLoading,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    saveForm,
    publishForm,
    closeForm,
  } = useFormBuilder(formId);

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveForm();
      toast.success('Formulário salvo com sucesso.');
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
      toast.success(`Formulário publicado! Token: ${result.publicToken}`);
    } catch {
      toast.error('Erro ao publicar formulário.');
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleClose() {
    setIsClosing(true);
    try {
      await closeForm();
      toast.success('Formulário encerrado.');
    } catch {
      toast.error('Erro ao encerrar formulário.');
    } finally {
      setIsClosing(false);
    }
  }

  async function handleSelectType(type: QuestionType) {
    setIsAddingQuestion(true);
    try {
      await addQuestion(type);
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
            className="text-xl font-semibold border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-violet-500 text-slate-900"
          />
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            placeholder="Descrição (opcional)"
            className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-violet-500 text-slate-600 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || (!isDirty && !!formId)}
          >
            <Save className="size-4 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Salvar rascunho'}
          </Button>

          {formId ? (
            <>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Globe className="size-4 mr-1.5" />
                {isPublishing ? 'Publicando...' : 'Publicar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isClosing}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="size-4 mr-1.5" />
                {isClosing ? 'Encerrando...' : 'Encerrar'}
              </Button>
            </>
          ) : null}
        </div>
      </div>

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
          className="w-full border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
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
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
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
          <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
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
