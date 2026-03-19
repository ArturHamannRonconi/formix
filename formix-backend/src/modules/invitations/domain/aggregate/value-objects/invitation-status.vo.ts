export enum InvitationStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export class InvitationStatus {
  private constructor(private readonly value: InvitationStatusEnum) {}

  static pending(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.PENDING);
  }

  static accepted(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.ACCEPTED);
  }

  static expired(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.EXPIRED);
  }

  static cancelled(): InvitationStatus {
    return new InvitationStatus(InvitationStatusEnum.CANCELLED);
  }

  static from(value: string): InvitationStatus {
    if (!Object.values(InvitationStatusEnum).includes(value as InvitationStatusEnum)) {
      throw new Error(`Invalid invitation status: ${value}`);
    }
    return new InvitationStatus(value as InvitationStatusEnum);
  }

  isPending(): boolean {
    return this.value === InvitationStatusEnum.PENDING;
  }

  isAccepted(): boolean {
    return this.value === InvitationStatusEnum.ACCEPTED;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: InvitationStatus): boolean {
    return this.value === other.value;
  }
}
