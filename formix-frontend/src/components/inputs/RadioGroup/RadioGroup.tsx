import { useId } from 'react';
import type { BaseInputProps, OptionItem } from '@/types/input.types';
import styles from './RadioGroup.module.css';

interface RadioGroupProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
}

export function RadioGroup({
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
}: RadioGroupProps) {
  const id = useId();

  return (
    <fieldset className={styles.wrapper} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </legend>
      <div className={styles.group} role="radiogroup">
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              required={required}
              className={styles.radio}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
}
