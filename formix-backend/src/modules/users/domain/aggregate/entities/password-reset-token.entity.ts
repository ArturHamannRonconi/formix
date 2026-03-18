import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { PasswordResetTokenId } from '../value-objects/password-reset-token-id.vo';

interface PasswordResetTokenProps {
  id: PasswordResetTokenId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export class PasswordResetTokenEntity {
  private props: PasswordResetTokenProps;
  private _rawToken?: string;

  private constructor(props: PasswordResetTokenProps, rawToken?: string) {
    this.props = props;
    this._rawToken = rawToken;
  }

  static create(expiresInMs: number): PasswordResetTokenEntity {
    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    return new PasswordResetTokenEntity(
      {
        id: PasswordResetTokenId.create(),
        tokenHash,
        expiresAt: new Date(now.getTime() + expiresInMs),
        createdAt: now,
      },
      rawToken,
    );
  }

  static reconstitute(props: PasswordResetTokenProps): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity(props);
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  get id(): PasswordResetTokenId { return this.props.id; }
  get tokenHash(): string { return this.props.tokenHash; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get rawToken(): string | undefined { return this._rawToken; }
}
