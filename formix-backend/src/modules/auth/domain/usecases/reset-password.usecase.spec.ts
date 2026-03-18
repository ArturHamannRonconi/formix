import { ResetPasswordUseCase } from './reset-password.usecase';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { PasswordResetTokenEntity } from '@modules/users/domain/aggregate/entities/password-reset-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function createUser() {
  const email = Email.create('test@example.com');
  const password = await Password.create('SecurePass1');
  return User.create({ name: 'Test', email, passwordHash: password });
}

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepo: { findByPasswordResetTokenHash: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    userRepo = {
      findByPasswordResetTokenHash: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new ResetPasswordUseCase(userRepo as any);
  });

  it('should reset password with valid token', async () => {
    const user = await createUser();
    const token = PasswordResetTokenEntity.create(3600000);
    user.setPasswordResetToken(token);

    userRepo.findByPasswordResetTokenHash.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ token: token.rawToken!, newPassword: 'NewSecurePass1' });

    expect(result.isFailure).toBe(false);
    expect(result.value.success).toBe(true);
    expect(user.passwordResetToken).toBeNull();
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should return failure when token not found', async () => {
    userRepo.findByPasswordResetTokenHash.mockResolvedValue(Output.fail('User not found'));

    const result = await useCase.execute({ token: 'invalid-token', newPassword: 'NewSecurePass1' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Invalid or expired token');
  });

  it('should return failure when token is expired', async () => {
    const user = await createUser();
    const expiredToken = PasswordResetTokenEntity.create(-1000);
    user.setPasswordResetToken(expiredToken);
    userRepo.findByPasswordResetTokenHash.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ token: 'some-token', newPassword: 'NewSecurePass1' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Token expired');
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('should invalidate all refresh tokens on password reset', async () => {
    const user = await createUser();
    const token = PasswordResetTokenEntity.create(3600000);
    user.setPasswordResetToken(token);
    const { RefreshTokenEntity } = require('@modules/users/domain/aggregate/entities/refresh-token.entity');
    user.addRefreshToken(RefreshTokenEntity.create(86400000));

    userRepo.findByPasswordResetTokenHash.mockResolvedValue(Output.ok(user));

    await useCase.execute({ token: token.rawToken!, newPassword: 'NewSecurePass1' });

    expect(user.refreshTokens.length).toBe(0);
  });
});
