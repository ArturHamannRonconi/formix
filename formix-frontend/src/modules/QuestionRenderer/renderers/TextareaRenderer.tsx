import { TextArea } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function TextareaRenderer({ question, value, onChange, error }: RendererProps) {
  return (
    <TextArea
      label={question.label}
      value={(value as string) ?? ''}
      onChange={onChange}
      required={question.required}
      error={error}
    />
  );
}
