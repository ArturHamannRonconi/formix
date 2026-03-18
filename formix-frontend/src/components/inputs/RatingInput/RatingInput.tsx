'use client';

import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import styles from './RatingInput.module.css';

interface RatingInputProps extends BaseInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  max?: number;
}

export function RatingInput({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  max = 5,
}: RatingInputProps) {
  const id = useId();

  function handleKeyDown(e: React.KeyboardEvent, rating: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(rating + 1, max);
      onChange(next);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(rating - 1, 1);
      onChange(prev);
    }
  }

  return (
    <div className={styles.wrapper}>
      <span id={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </span>
      <div
        className={styles.stars}
        role="group"
        aria-labelledby={id}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            className={`${styles.star}${value !== null && rating <= value ? ` ${styles.starFilled}` : ''}`}
            onClick={() => onChange(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            disabled={disabled}
            aria-label={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`}
            aria-pressed={value === rating}
          >
            ★
          </button>
        ))}
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
