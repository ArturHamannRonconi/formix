import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { InvitationId } from './value-objects/invitation-id.vo';
import { InvitationStatus } from './value-objects/invitation-status.vo';

interface InvitationProps {
  id: InvitationId;
  organizationId: string;
  email: string;
  tokenHash: string;
  role: 'member';
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationInput {
  organizationId: string;
  email: string;
  role?: 'member';
  expiresInMs: number;
}

export class Invitation {
  private props: InvitationProps;
  private _rawToken?: string;

  private constructor(props: InvitationProps, rawToken?: string) {
    this.props = props;
    this._rawToken = rawToken;
  }

  static create(input: CreateInvitationInput): Invitation {
    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    return new Invitation(
      {
        id: InvitationId.create(),
        organizationId: input.organizationId,
        email: input.email.toLowerCase(),
        tokenHash,
        role: input.role ?? 'member',
        status: InvitationStatus.pending(),
        expiresAt: new Date(now.getTime() + input.expiresInMs),
        createdAt: now,
        updatedAt: now,
      },
      rawToken,
    );
  }

  static reconstitute(props: InvitationProps): Invitation {
    return new Invitation(props);
  }

  accept(): void {
    this.props.status = InvitationStatus.accepted();
    this.props.updatedAt = new Date();
  }

  expire(): void {
    this.props.status = InvitationStatus.expired();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    this.props.status = InvitationStatus.cancelled();
    this.props.updatedAt = new Date();
  }

  renewToken(expiresInMs: number): void {
    const rawToken = randomUUID();
    this.props.tokenHash = createHash('sha256').update(rawToken).digest('hex');
    this.props.expiresAt = new Date(Date.now() + expiresInMs);
    this.props.updatedAt = new Date();
    this._rawToken = rawToken;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isPending(): boolean {
    return this.props.status.isPending();
  }

  get id(): InvitationId {
    return this.props.id;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get email(): string {
    return this.props.email;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get role(): 'member' {
    return this.props.role;
  }

  get status(): InvitationStatus {
    return this.props.status;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get rawToken(): string | undefined {
    return this._rawToken;
  }
}
