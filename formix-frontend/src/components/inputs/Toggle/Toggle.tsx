import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<BaseInputProps, 'disabled'> {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
}: ToggleProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </span>
      <div className={styles.row}>
        <label className={styles.switch} aria-label={label}>
          <input
            id={id}
            type="checkbox"
            role="switch"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            required={required}
            aria-checked={value}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={styles.input}
          />
          <span className={styles.track} aria-hidden="true" />
        </label>
        <span className={styles.switchLabel}>{value ? 'Sim' : 'Não'}</span>
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
