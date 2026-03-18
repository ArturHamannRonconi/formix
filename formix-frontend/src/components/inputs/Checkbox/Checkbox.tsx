import { useId } from 'react';
import type { BaseInputProps, OptionItem } from '@/types/input.types';
import styles from './Checkbox.module.css';

interface CheckboxProps extends BaseInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: OptionItem[];
}

export function Checkbox({
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
}: CheckboxProps) {
  const id = useId();

  function handleChange(optionValue: string, checked: boolean) {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  }

  return (
    <fieldset className={styles.wrapper} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </legend>
      <div className={styles.group}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="checkbox"
              value={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={disabled}
              className={styles.checkbox}
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
