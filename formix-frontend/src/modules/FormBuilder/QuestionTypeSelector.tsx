'use client';

import {
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  ToggleLeft,
  ChevronDown,
  Hash,
  Calendar,
  Star,
  Upload,
  Mail,
} from 'lucide-react';
import type { QuestionType } from '@/services/forms/forms.types';

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void;
  onClose: () => void;
}

interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  icon: React.ReactNode;
}

const questionTypes: QuestionTypeOption[] = [
  { type: 'text', label: 'Texto curto', icon: <Type className="size-5" /> },
  { type: 'textarea', label: 'Texto longo', icon: <AlignLeft className="size-5" /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="size-5" /> },
  { type: 'radio', label: 'Múltipla escolha', icon: <Circle className="size-5" /> },
  { type: 'toggle', label: 'Toggle', icon: <ToggleLeft className="size-5" /> },
  { type: 'dropdown', label: 'Seleção', icon: <ChevronDown className="size-5" /> },
  { type: 'number', label: 'Número', icon: <Hash className="size-5" /> },
  { type: 'date', label: 'Data', icon: <Calendar className="size-5" /> },
  { type: 'rating', label: 'Avaliação', icon: <Star className="size-5" /> },
  { type: 'file', label: 'Arquivo', icon: <Upload className="size-5" /> },
  { type: 'email', label: 'Email', icon: <Mail className="size-5" /> },
];

export function QuestionTypeSelector({ onSelect, onClose }: QuestionTypeSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Escolha o tipo de pergunta</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {questionTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors text-slate-700 hover:text-violet-700"
            >
              {icon}
              <span className="text-xs font-medium text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
