export interface BaseInputProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface OptionItem {
  label: string;
  value: string;
}
