import { RatingInput } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function RatingRenderer({ question, value, onChange, error }: RendererProps) {
  return (
    <RatingInput
      label={question.label}
      value={value !== undefined && value !== null ? Number(value) : null}
      onChange={onChange}
      required={question.required}
      max={question.validation?.max ?? 5}
      error={error}
    />
  );
}
