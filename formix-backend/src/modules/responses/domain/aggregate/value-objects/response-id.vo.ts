import { randomUUID } from 'crypto';

export class ResponseId {
  private constructor(private readonly value: string) {}

  static create(): ResponseId {
    return new ResponseId(randomUUID());
  }

  static from(value: string): ResponseId {
    if (!value?.trim()) throw new Error('Invalid ResponseId');
    return new ResponseId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ResponseId): boolean {
    return this.value === other.value;
  }
}
