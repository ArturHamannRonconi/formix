import { randomUUID } from 'crypto';

export class PublicToken {
  private constructor(private readonly value: string) {}

  static generate(): PublicToken {
    return new PublicToken(randomUUID());
  }

  static from(value: string): PublicToken {
    if (!value?.trim()) throw new Error('Invalid PublicToken');
    return new PublicToken(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PublicToken): boolean {
    return this.value === other.value;
  }
}
