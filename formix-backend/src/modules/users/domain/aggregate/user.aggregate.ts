import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { DomainError } from '@shared/domain-error';
import { UserId } from './value-objects/user-id.vo';
import { EmailConfirmationTokenEntity } from './entities/email-confirmation-token.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';

interface UserProps {
  id: UserId;
  name: string;
  email: Email;
  passwordHash: Password;
  emailConfirmed: boolean;
  emailConfirmationToken: EmailConfirmationTokenEntity | null;
  refreshTokens: RefreshTokenEntity[];
  passwordResetToken: PasswordResetTokenEntity | null;
  createdAt: Date;
  updatedAt: Date;
}

type CreateUserProps = Omit<UserProps, 'id' | 'emailConfirmed' | 'emailConfirmationToken' | 'refreshTokens' | 'passwordResetToken' | 'createdAt' | 'updatedAt'>;

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(input: CreateUserProps): User {
    const now = new Date();
    return new User({
      id: UserId.create(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      emailConfirmed: false,
      emailConfirmationToken: null,
      refreshTokens: [],
      passwordResetToken: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  confirmEmail(): void {
    this.props.emailConfirmed = true;
    this.props.emailConfirmationToken = null;
    this.props.updatedAt = new Date();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainError('Name cannot be empty');
    }
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updatePassword(password: Password): void {
    this.props.passwordHash = password;
    this.props.passwordResetToken = null;
    this.props.updatedAt = new Date();
  }

  setEmailConfirmationToken(token: EmailConfirmationTokenEntity): void {
    this.props.emailConfirmationToken = token;
    this.props.updatedAt = new Date();
  }

  addRefreshToken(token: RefreshTokenEntity): void {
    this.props.refreshTokens.push(token);
    this.props.updatedAt = new Date();
  }

  findRefreshTokenByHash(hash: string): RefreshTokenEntity | null {
    return this.props.refreshTokens.find(t => t.tokenHash === hash) ?? null;
  }

  invalidateRefreshTokenFamily(family: string): void {
    this.props.refreshTokens = this.props.refreshTokens.filter(t => t.family !== family);
    this.props.updatedAt = new Date();
  }

  invalidateAllRefreshTokens(): void {
    this.props.refreshTokens = [];
    this.props.updatedAt = new Date();
  }

  setPasswordResetToken(token: PasswordResetTokenEntity): void {
    this.props.passwordResetToken = token;
    this.props.updatedAt = new Date();
  }

  get id(): UserId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): Password {
    return this.props.passwordHash;
  }

  get emailConfirmed(): boolean {
    return this.props.emailConfirmed;
  }

  get emailConfirmationToken(): EmailConfirmationTokenEntity | null {
    return this.props.emailConfirmationToken;
  }

  get refreshTokens(): RefreshTokenEntity[] {
    return [...this.props.refreshTokens];
  }

  get passwordResetToken(): PasswordResetTokenEntity | null {
    return this.props.passwordResetToken;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
