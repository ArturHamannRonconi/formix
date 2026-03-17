import { DomainError } from '../domain-error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new DomainError(`Invalid email: ${raw}`);
    }
    return new Email(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
