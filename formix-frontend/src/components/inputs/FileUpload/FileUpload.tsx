import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import styles from './FileUpload.module.css';

interface FileUploadProps extends BaseInputProps {
  value: null;
  onChange: (value: null) => void;
}

export function FileUpload({ label, error, required }: FileUploadProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <span id={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </span>
      <div
        className={styles.placeholder}
        aria-labelledby={id}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        Upload em breve
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
