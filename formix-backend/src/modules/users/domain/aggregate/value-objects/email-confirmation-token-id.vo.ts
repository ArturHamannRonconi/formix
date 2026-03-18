import { randomUUID } from 'crypto';

export class EmailConfirmationTokenId {
  private constructor(private readonly value: string) {}

  static create(): EmailConfirmationTokenId {
    return new EmailConfirmationTokenId(randomUUID());
  }

  static from(value: string): EmailConfirmationTokenId {
    if (!value || value.trim().length === 0) {
      throw new Error('Invalid EmailConfirmationTokenId');
    }
    return new EmailConfirmationTokenId(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EmailConfirmationTokenId): boolean {
    return this.value === other.value;
  }
}
