import { randomUUID } from 'crypto';

export class ResponseEmailId {
  private constructor(private readonly value: string) {}

  static create(): ResponseEmailId {
    return new ResponseEmailId(randomUUID());
  }

  static from(value: string): ResponseEmailId {
    if (!value?.trim()) throw new Error('Invalid ResponseEmailId');
    return new ResponseEmailId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ResponseEmailId): boolean {
    return this.value === other.value;
  }
}
