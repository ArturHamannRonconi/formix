import { randomUUID } from 'crypto';

export class PasswordResetTokenId {
  private constructor(private readonly value: string) {}

  static create(): PasswordResetTokenId {
    return new PasswordResetTokenId(randomUUID());
  }

  static from(value: string): PasswordResetTokenId {
    if (!value || value.trim().length === 0) throw new Error('Invalid PasswordResetTokenId');
    return new PasswordResetTokenId(value.trim());
  }

  getValue(): string { return this.value; }
  equals(other: PasswordResetTokenId): boolean { return this.value === other.value; }
}
