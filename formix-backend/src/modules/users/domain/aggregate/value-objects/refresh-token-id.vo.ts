import { randomUUID } from 'crypto';

export class RefreshTokenId {
  private constructor(private readonly value: string) {}

  static create(): RefreshTokenId {
    return new RefreshTokenId(randomUUID());
  }

  static from(value: string): RefreshTokenId {
    if (!value || value.trim().length === 0) throw new Error('Invalid RefreshTokenId');
    return new RefreshTokenId(value.trim());
  }

  getValue(): string { return this.value; }
  equals(other: RefreshTokenId): boolean { return this.value === other.value; }
}
