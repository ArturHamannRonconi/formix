import { ConfirmEmailUseCase } from './confirm-email.usecase';
import { createHash } from 'crypto';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { EmailConfirmationTokenEntity } from '@modules/users/domain/aggregate/entities/email-confirmation-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function createUser() {
  const email = Email.create('test@example.com');
  const password = await Password.create('SecurePass1');
  return User.create({ name: 'Test', email, passwordHash: password });
}

describe('ConfirmEmailUseCase', () => {
  let useCase: ConfirmEmailUseCase;
  let userRepo: { findByEmailConfirmationTokenHash: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    userRepo = {
      findByEmailConfirmationTokenHash: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new ConfirmEmailUseCase(userRepo as any);
  });

  it('should confirm email with valid token', async () => {
    const user = await createUser();
    const token = EmailConfirmationTokenEntity.create(86400000);
    user.setEmailConfirmationToken(token);

    const hash = createHash('sha256').update(token.rawToken!).digest('hex');
    userRepo.findByEmailConfirmationTokenHash.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ token: token.rawToken! });

    expect(result.isFailure).toBe(false);
    expect(result.value.success).toBe(true);
    expect(user.emailConfirmed).toBe(true);
    expect(user.emailConfirmationToken).toBeNull();
    expect(userRepo.save).toHaveBeenCalledWith(user);
  });

  it('should return failure when token not found', async () => {
    userRepo.findByEmailConfirmationTokenHash.mockResolvedValue(Output.fail('User not found'));
    const result = await useCase.execute({ token: 'invalid-token' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Invalid or expired token');
  });

  it('should return failure when token is expired', async () => {
    const user = await createUser();
    const expiredToken = EmailConfirmationTokenEntity.create(-1000);
    user.setEmailConfirmationToken(expiredToken);
    userRepo.findByEmailConfirmationTokenHash.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ token: 'some-token' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Token expired');
    expect(userRepo.save).not.toHaveBeenCalled();
  });
});
