import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import styles from './NumberInput.module.css';

interface NumberInputProps extends BaseInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  min,
  max,
}: NumberInputProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === '' ? null : Number(raw));
        }}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
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
