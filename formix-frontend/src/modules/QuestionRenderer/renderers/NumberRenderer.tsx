import { NumberInput } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function NumberRenderer({ question, value, onChange, error }: RendererProps) {
  return (
    <NumberInput
      label={question.label}
      value={value !== undefined && value !== null ? Number(value) : null}
      onChange={onChange}
      required={question.required}
      min={question.validation?.min}
      max={question.validation?.max}
      error={error}
    />
  );
}
