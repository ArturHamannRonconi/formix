import { RadioGroup } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function RadioRenderer({ question, value, onChange, error }: RendererProps) {
  const options = (question.options ?? []).map(o => ({ label: o, value: o }));
  return (
    <RadioGroup
      label={question.label}
      value={(value as string) ?? ''}
      onChange={onChange}
      options={options}
      required={question.required}
      error={error}
    />
  );
}
