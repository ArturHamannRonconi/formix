import { Toggle } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function ToggleRenderer({ question, value, onChange, error }: RendererProps) {
  return (
    <Toggle
      label={question.label}
      value={(value as boolean) ?? false}
      onChange={onChange}
      required={question.required}
      error={error}
    />
  );
}
