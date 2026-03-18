import { useId } from 'react';
import type { BaseInputProps } from '@/types/input.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextInputProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'url' | 'tel';
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder,
  type = 'text',
}: TextInputProps) {
  const id = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(error && 'border-destructive focus-visible:ring-destructive/20')}
      />
      {error && (
        <span id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
