import { LogoutUseCase } from './logout.usecase';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { RefreshTokenEntity } from '@modules/users/domain/aggregate/entities/refresh-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function createUser() {
  const email = Email.create('test@example.com');
  const password = await Password.create('SecurePass1');
  return User.create({ name: 'Test', email, passwordHash: password });
}

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let userRepo: { findById: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    userRepo = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new LogoutUseCase(userRepo as any);
  });

  it('should logout and invalidate specific refresh token family', async () => {
    const user = await createUser();
    const token = RefreshTokenEntity.create(86400000);
    user.addRefreshToken(token);

    userRepo.findById.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ userId: user.id.getValue(), refreshToken: token.rawToken! });

    expect(result.isFailure).toBe(false);
    expect(result.value.success).toBe(true);
    expect(user.refreshTokens.length).toBe(0);
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should logout and invalidate all refresh tokens when no refreshToken provided', async () => {
    const user = await createUser();
    const token1 = RefreshTokenEntity.create(86400000);
    const token2 = RefreshTokenEntity.create(86400000);
    user.addRefreshToken(token1);
    user.addRefreshToken(token2);

    userRepo.findById.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ userId: user.id.getValue() });

    expect(result.isFailure).toBe(false);
    expect(user.refreshTokens.length).toBe(0);
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should return failure when user not found', async () => {
    userRepo.findById.mockResolvedValue(Output.fail('User not found'));

    const result = await useCase.execute({ userId: 'non-existent-id' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('User not found');
  });
});
