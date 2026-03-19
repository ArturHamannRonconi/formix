export type FormStatus = 'draft' | 'active' | 'expired' | 'closed';

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'toggle'
  | 'dropdown'
  | 'number'
  | 'date'
  | 'rating'
  | 'file'
  | 'email';

export interface FormSettings {
  expiresAt?: string;
  maxResponses?: number;
  allowMultipleResponses: boolean;
  allowedEmailDomains: string[];
}

export interface FormSummary {
  id: string;
  organizationId: string;
  createdBy: string;
  title: string;
  description?: string;
  status: FormStatus;
  publicToken?: string;
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  formId: string;
  organizationId: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
  createdAt: string;
}

export interface FormDetail extends FormSummary {
  questions: Question[];
}

export interface CreateFormInput {
  title: string;
  description?: string;
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  settings?: Partial<FormSettings>;
}
