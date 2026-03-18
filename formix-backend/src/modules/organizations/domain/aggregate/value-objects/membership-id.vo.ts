import { randomUUID } from 'crypto';

export class MembershipId {
  private constructor(private readonly value: string) {}

  static create(): MembershipId {
    return new MembershipId(randomUUID());
  }

  static from(value: string): MembershipId {
    if (!value || value.trim().length === 0) {
      throw new Error('Invalid MembershipId');
    }
    return new MembershipId(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MembershipId): boolean {
    return this.value === other.value;
  }
}
