import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { RefreshTokenId } from '../value-objects/refresh-token-id.vo';

interface RefreshTokenProps {
  id: RefreshTokenId;
  tokenHash: string;
  family: string;
  usedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshTokenEntity {
  private props: RefreshTokenProps;
  private _rawToken?: string;

  private constructor(props: RefreshTokenProps, rawToken?: string) {
    this.props = props;
    this._rawToken = rawToken;
  }

  static create(expiresInMs: number): RefreshTokenEntity {
    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    return new RefreshTokenEntity(
      {
        id: RefreshTokenId.create(),
        tokenHash,
        family: randomUUID(),
        usedAt: null,
        expiresAt: new Date(now.getTime() + expiresInMs),
        createdAt: now,
      },
      rawToken,
    );
  }

  static createWithFamily(family: string, expiresInMs: number): RefreshTokenEntity {
    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    return new RefreshTokenEntity(
      {
        id: RefreshTokenId.create(),
        tokenHash,
        family,
        usedAt: null,
        expiresAt: new Date(now.getTime() + expiresInMs),
        createdAt: now,
      },
      rawToken,
    );
  }

  static reconstitute(props: RefreshTokenProps): RefreshTokenEntity {
    return new RefreshTokenEntity(props);
  }

  markAsUsed(): void {
    this.props.usedAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  wasUsed(): boolean {
    return this.props.usedAt !== null;
  }

  get id(): RefreshTokenId { return this.props.id; }
  get tokenHash(): string { return this.props.tokenHash; }
  get family(): string { return this.props.family; }
  get usedAt(): Date | null { return this.props.usedAt; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get rawToken(): string | undefined { return this._rawToken; }
}
