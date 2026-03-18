import { randomUUID } from 'crypto';

export class UserId {
  private constructor(private readonly value: string) {}

  static create(): UserId {
    return new UserId(randomUUID());
  }

  static from(value: string): UserId {
    if (!value || value.trim().length === 0) {
      throw new Error('Invalid UserId');
    }
    return new UserId(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
