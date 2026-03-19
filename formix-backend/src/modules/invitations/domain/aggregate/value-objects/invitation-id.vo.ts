import { randomUUID } from 'crypto';

export class InvitationId {
  private constructor(private readonly value: string) {}

  static create(): InvitationId {
    return new InvitationId(randomUUID());
  }

  static from(value: string): InvitationId {
    if (!value?.trim()) throw new Error('Invalid InvitationId');
    return new InvitationId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: InvitationId): boolean {
    return this.value === other.value;
  }
}
