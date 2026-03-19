export enum FormStatusEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CLOSED = 'closed',
}

export class FormStatus {
  private constructor(private readonly value: FormStatusEnum) {}

  static draft(): FormStatus {
    return new FormStatus(FormStatusEnum.DRAFT);
  }

  static active(): FormStatus {
    return new FormStatus(FormStatusEnum.ACTIVE);
  }

  static expired(): FormStatus {
    return new FormStatus(FormStatusEnum.EXPIRED);
  }

  static closed(): FormStatus {
    return new FormStatus(FormStatusEnum.CLOSED);
  }

  static from(value: string): FormStatus {
    if (!Object.values(FormStatusEnum).includes(value as FormStatusEnum)) {
      throw new Error(`Invalid form status: ${value}`);
    }
    return new FormStatus(value as FormStatusEnum);
  }

  isDraft(): boolean {
    return this.value === FormStatusEnum.DRAFT;
  }

  isActive(): boolean {
    return this.value === FormStatusEnum.ACTIVE;
  }

  isExpired(): boolean {
    return this.value === FormStatusEnum.EXPIRED;
  }

  isClosed(): boolean {
    return this.value === FormStatusEnum.CLOSED;
  }

  canAcceptResponses(): boolean {
    return this.value === FormStatusEnum.ACTIVE;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FormStatus): boolean {
    return this.value === other.value;
  }
}
