import { FileUpload } from '@/components/inputs';
import type { RendererProps } from '../QuestionRenderer';

export function FileRenderer({ question, onChange, error }: RendererProps) {
  return (
    <FileUpload
      label={question.label}
      value={null}
      onChange={() => onChange(null)}
      required={question.required}
      error={error}
    />
  );
}
