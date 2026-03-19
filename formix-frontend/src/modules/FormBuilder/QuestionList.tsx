'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';
import type { Question } from '@/services/forms/forms.types';

interface QuestionListProps {
  questions: Question[];
  onUpdate: (id: string, data: Partial<Question>) => void;
  onRemove: (id: string) => void;
  onReorder: (newQuestions: Question[]) => void;
}

interface SortableQuestionItemProps {
  question: Question;
  onUpdate: (id: string, data: Partial<Question>) => void;
  onRemove: (id: string) => void;
}

function SortableQuestionItem({ question, onUpdate, onRemove }: SortableQuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-start">
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="mt-5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
        aria-label="Arrastar pergunta"
      >
        <GripVertical className="size-5" />
      </button>
      <div className="flex-1">
        <QuestionEditor question={question} onUpdate={onUpdate} onRemove={onRemove} />
      </div>
    </div>
  );
}

export function QuestionList({ questions, onUpdate, onRemove, onReorder }: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(questions, oldIndex, newIndex);
    onReorder(reordered);
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
        <p className="text-sm font-medium">Nenhuma pergunta adicionada</p>
        <p className="text-xs mt-1">Clique em "Adicionar pergunta" para começar.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {questions.map((question) => (
            <SortableQuestionItem
              key={question.id}
              question={question}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
