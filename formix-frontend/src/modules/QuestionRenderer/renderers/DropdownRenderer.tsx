import { Dropdown } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function DropdownRenderer({ question, value, onChange, error }: RendererProps) {
  const options = (question.options ?? []).map(o => ({ label: o, value: o }));
  return (
    <Dropdown
      label={question.label}
      value={(value as string) ?? ''}
      onChange={onChange}
      options={options}
      required={question.required}
      error={error}
      placeholder="Selecione uma opção"
    />
  );
}
