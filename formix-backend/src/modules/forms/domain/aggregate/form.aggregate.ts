import { FormId } from './value-objects/form-id.vo';
import { FormStatus } from './value-objects/form-status.vo';
import { PublicToken } from './value-objects/public-token.vo';

export interface FormSettings {
  expiresAt?: Date;
  maxResponses?: number;
  allowMultipleResponses: boolean;
  allowedEmailDomains: string[];
}

interface FormProps {
  id: FormId;
  organizationId: string;
  createdBy: string;
  title: string;
  description?: string;
  publicToken?: PublicToken;
  settings: FormSettings;
  status: FormStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormInput {
  organizationId: string;
  createdBy: string;
  title: string;
  description?: string;
}

const DEFAULT_SETTINGS: FormSettings = {
  allowMultipleResponses: false,
  allowedEmailDomains: [],
};

export class FormAggregate {
  private props: FormProps;

  private constructor(props: FormProps) {
    this.props = props;
  }

  static create(input: CreateFormInput): FormAggregate {
    if (!input.title?.trim()) throw new Error('Form title is required');
    if (!input.organizationId?.trim()) throw new Error('organizationId is required');
    if (!input.createdBy?.trim()) throw new Error('createdBy is required');

    const now = new Date();
    return new FormAggregate({
      id: FormId.create(),
      organizationId: input.organizationId,
      createdBy: input.createdBy,
      title: input.title,
      description: input.description,
      publicToken: undefined,
      settings: { ...DEFAULT_SETTINGS },
      status: FormStatus.draft(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: FormProps): FormAggregate {
    return new FormAggregate(props);
  }

  update(data: { title?: string; description?: string; settings?: Partial<FormSettings> }): void {
    if (data.title !== undefined) this.props.title = data.title;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.settings !== undefined) {
      this.props.settings = { ...this.props.settings, ...data.settings };
    }
    this.props.updatedAt = new Date();
  }

  publish(publicToken: PublicToken): void {
    if (!this.props.status.isDraft()) {
      throw new Error('Form can only be published from draft status');
    }
    this.props.publicToken = publicToken;
    this.props.status = FormStatus.active();
    this.props.updatedAt = new Date();
  }

  close(): void {
    if (!this.props.status.isActive()) {
      throw new Error('Form can only be closed from active status');
    }
    this.props.status = FormStatus.closed();
    this.props.updatedAt = new Date();
  }

  isExpired(): boolean {
    if (!this.props.settings.expiresAt) return false;
    return new Date() > this.props.settings.expiresAt;
  }

  canAcceptResponses(): boolean {
    return this.props.status.canAcceptResponses() && !this.isExpired();
  }

  get id(): FormId {
    return this.props.id;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get publicToken(): PublicToken | undefined {
    return this.props.publicToken;
  }

  get settings(): FormSettings {
    return this.props.settings;
  }

  get status(): FormStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
