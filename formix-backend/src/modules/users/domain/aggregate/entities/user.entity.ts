import { randomUUID } from 'crypto';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { DomainError } from '@shared/domain-error';

interface UserProps {
  id: string;
  name: string;
  email: Email;
  passwordHash: Password;
  emailConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type CreateUserProps = Omit<UserProps, 'id' | 'emailConfirmed' | 'createdAt' | 'updatedAt'>;

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(input: CreateUserProps): User {
    const now = new Date();
    return new User({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      emailConfirmed: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  confirmEmail(): void {
    this.props.emailConfirmed = true;
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
    this.props.updatedAt = new Date();
  }

  get id(): string {
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
