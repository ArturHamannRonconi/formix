import { useId } from 'react';
import type { BaseInputProps, OptionItem } from '@/types/input.types';
import styles from './Dropdown.module.css';

interface DropdownProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
}

export function Dropdown({
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  placeholder,
}: DropdownProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.select}${error ? ` ${styles.selectError}` : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
