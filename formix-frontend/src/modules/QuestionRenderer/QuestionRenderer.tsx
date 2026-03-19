import type { PublicFormQuestion } from '@/services/responses/responses.types';
import { TextRenderer } from './renderers/TextRenderer';
import { TextareaRenderer } from './renderers/TextareaRenderer';
import { CheckboxRenderer } from './renderers/CheckboxRenderer';
import { RadioRenderer } from './renderers/RadioRenderer';
import { ToggleRenderer } from './renderers/ToggleRenderer';
import { DropdownRenderer } from './renderers/DropdownRenderer';
import { NumberRenderer } from './renderers/NumberRenderer';
import { DateRenderer } from './renderers/DateRenderer';
import { RatingRenderer } from './renderers/RatingRenderer';
import { FileRenderer } from './renderers/FileRenderer';
import { EmailRenderer } from './renderers/EmailRenderer';

export interface RendererProps {
  question: PublicFormQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}

export function QuestionRenderer({ question, value, onChange, error }: RendererProps) {
  const props = { question, value, onChange, error };

  switch (question.type) {
    case 'text':
      return <TextRenderer {...props} />;
    case 'textarea':
      return <TextareaRenderer {...props} />;
    case 'checkbox':
      return <CheckboxRenderer {...props} />;
    case 'radio':
      return <RadioRenderer {...props} />;
    case 'toggle':
      return <ToggleRenderer {...props} />;
    case 'dropdown':
      return <DropdownRenderer {...props} />;
    case 'number':
      return <NumberRenderer {...props} />;
    case 'date':
      return <DateRenderer {...props} />;
    case 'rating':
      return <RatingRenderer {...props} />;
    case 'file':
      return <FileRenderer {...props} />;
    case 'email':
      return <EmailRenderer {...props} />;
    default:
      return null;
  }
}
