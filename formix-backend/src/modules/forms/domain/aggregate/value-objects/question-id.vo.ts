import { randomUUID } from 'crypto';

export class QuestionId {
  private constructor(private readonly value: string) {}

  static create(): QuestionId {
    return new QuestionId(randomUUID());
  }

  static from(value: string): QuestionId {
    if (!value?.trim()) throw new Error('Invalid QuestionId');
    return new QuestionId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: QuestionId): boolean {
    return this.value === other.value;
  }
}
