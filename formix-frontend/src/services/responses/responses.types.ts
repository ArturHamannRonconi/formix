import type { QuestionType } from '@/services/forms/forms.types';

export interface PublicFormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string;
  status: string;
  questions: PublicFormQuestion[];
}

export interface Answer {
  questionId: string;
  value: unknown;
}

export interface SubmitResponseInput {
  email: string;
  answers: Answer[];
}

export interface ResponseRow {
  id: string;
  answers: Answer[];
  submittedAt: string;
}

export interface ListResponsesOutput {
  responses: ResponseRow[];
  total: number;
  offset: number;
  limit: number;
}
