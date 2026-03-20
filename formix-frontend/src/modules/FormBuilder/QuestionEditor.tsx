'use client';

import { useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QuestionRenderer } from '@/modules/QuestionRenderer/QuestionRenderer';
import type { Question } from '@/services/forms/forms.types';
import type { PublicFormQuestion } from '@/services/responses/responses.types';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (id: string, data: Partial<Question>) => void;
  onRemove: (id: string) => void;
}

const typesWithOptions = ['checkbox', 'radio', 'dropdown'];

const typeLabels: Record<string, string> = {
  text: 'Texto curto',
  textarea: 'Texto longo',
  checkbox: 'Checkbox',
  radio: 'Múltipla escolha',
  toggle: 'Toggle',
  dropdown: 'Seleção',
  number: 'Número',
  date: 'Data',
  rating: 'Avaliação',
  file: 'Arquivo',
  email: 'Email',
};

export function QuestionEditor({ question, onUpdate, onRemove }: QuestionEditorProps) {
  const [newOption, setNewOption] = useState('');
  const [previewValue, setPreviewValue] = useState<unknown>(undefined);
  const hasOptions = typesWithOptions.includes(question.type);
  const options = question.options ?? [];

  function handleAddOption() {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    onUpdate(question.id, { options: [...options, trimmed] });
    setNewOption('');
  }

  function handleRemoveOption(index: number) {
    onUpdate(question.id, { options: options.filter((_, i) => i !== index) });
  }

  function handleOptionKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  }

  return (
    <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <Label htmlFor={`label-${question.id}`}>Pergunta</Label>
            <Input
              id={`label-${question.id}`}
              value={question.label}
              onChange={(e) => onUpdate(question.id, { label: e.target.value })}
              placeholder="Digite a pergunta..."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`desc-${question.id}`}>Descrição (opcional)</Label>
            <Input
              id={`desc-${question.id}`}
              value={question.description ?? ''}
              onChange={(e) =>
                onUpdate(question.id, { description: e.target.value || undefined })
              }
              placeholder="Instrução adicional para o respondente..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id={`required-${question.id}`}
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
              className="rounded border-slate-300 accent-violet-600 size-4"
            />
            <Label htmlFor={`required-${question.id}`} className="cursor-pointer text-sm">
              Obrigatória
            </Label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(question.id)}
          className="text-slate-400 hover:text-red-500 transition-colors mt-1 shrink-0"
          aria-label="Remover pergunta"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {hasOptions && (
        <div className="space-y-2">
          <Label>Opções</Label>
          <div className="space-y-1.5">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => {
                    const updated = options.map((o, i) => (i === index ? e.target.value : o));
                    onUpdate(question.id, { options: updated });
                  }}
                  placeholder={`Opção ${index + 1}`}
                  className="text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-slate-400 hover:text-red-500 shrink-0"
                  aria-label="Remover opção"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={handleOptionKeyDown}
              placeholder="Nova opção..."
              className="text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 space-y-1.5">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Pré-visualização</span>
        <div className="pointer-events-none opacity-80">
          <QuestionRenderer
            question={question as unknown as PublicFormQuestion}
            value={previewValue}
            onChange={setPreviewValue}
          />
        </div>
      </div>
    </div>
  );
}
