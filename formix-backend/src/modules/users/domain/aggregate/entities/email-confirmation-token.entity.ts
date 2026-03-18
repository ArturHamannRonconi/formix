import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { EmailConfirmationTokenId } from '../value-objects/email-confirmation-token-id.vo';

interface EmailConfirmationTokenProps {
  id: EmailConfirmationTokenId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export class EmailConfirmationTokenEntity {
  private props: EmailConfirmationTokenProps;
  private _rawToken?: string;

  private constructor(props: EmailConfirmationTokenProps, rawToken?: string) {
    this.props = props;
    this._rawToken = rawToken;
  }

  static create(expiresInMs: number): EmailConfirmationTokenEntity {
    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    return new EmailConfirmationTokenEntity(
      {
        id: EmailConfirmationTokenId.create(),
        tokenHash,
        expiresAt: new Date(now.getTime() + expiresInMs),
        createdAt: now,
      },
      rawToken,
    );
  }

  static reconstitute(props: EmailConfirmationTokenProps): EmailConfirmationTokenEntity {
    return new EmailConfirmationTokenEntity(props);
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  get id(): EmailConfirmationTokenId {
    return this.props.id;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get rawToken(): string | undefined {
    return this._rawToken;
  }
}
