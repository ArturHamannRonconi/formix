import { User } from '../aggregate/user.aggregate';
import { UserId } from '../aggregate/value-objects/user-id.vo';
import { Email } from '@shared/value-objects/email.vo';
import { Output } from '@shared/output';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<Output<User>>;
  findByEmail(email: Email): Promise<Output<User>>;
  findByEmailConfirmationTokenHash(tokenHash: string): Promise<Output<User>>;
  exists(email: Email): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
