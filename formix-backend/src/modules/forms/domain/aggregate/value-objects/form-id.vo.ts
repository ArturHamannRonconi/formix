import { randomUUID } from 'crypto';

export class FormId {
  private constructor(private readonly value: string) {}

  static create(): FormId {
    return new FormId(randomUUID());
  }

  static from(value: string): FormId {
    if (!value?.trim()) throw new Error('Invalid FormId');
    return new FormId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FormId): boolean {
    return this.value === other.value;
  }
}
