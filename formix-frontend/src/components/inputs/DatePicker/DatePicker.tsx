import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import styles from './DatePicker.module.css';

interface DatePickerProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
}: DatePickerProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.input}${error ? ` ${styles.inputError}` : ''}`}
      />
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
