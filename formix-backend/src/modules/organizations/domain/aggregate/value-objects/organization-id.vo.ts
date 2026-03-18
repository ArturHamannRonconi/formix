import { randomUUID } from 'crypto';

export class OrganizationId {
  private constructor(private readonly value: string) {}

  static create(): OrganizationId {
    return new OrganizationId(randomUUID());
  }

  static from(value: string): OrganizationId {
    if (!value || value.trim().length === 0) {
      throw new Error('Invalid OrganizationId');
    }
    return new OrganizationId(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OrganizationId): boolean {
    return this.value === other.value;
  }
}
