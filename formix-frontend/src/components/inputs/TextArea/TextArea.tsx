import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import styles from './TextArea.module.css';

interface TextAreaProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder,
  rows = 4,
}: TextAreaProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.textarea}${error ? ` ${styles.textareaError}` : ''}`}
      />
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
