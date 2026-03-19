import { TextInput } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function TextRenderer({ question, value, onChange, error }: RendererProps) {
  return (
    <TextInput
      label={question.label}
      value={(value as string) ?? ''}
      onChange={onChange}
      required={question.required}
      error={error}
    />
  );
}
