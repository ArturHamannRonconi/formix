import { GetProfileUseCase } from './get-profile.usecase';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let userRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailConfirmationTokenHash: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByPasswordResetTokenHash: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
    };
    useCase = new GetProfileUseCase(userRepo);
  });

  it('should return user profile without passwordHash', async () => {
    const userId = UserId.create();
    const user = User.reconstitute({
      id: userId,
      name: 'João Silva',
      email: Email.create('joao@example.com'),
      passwordHash: Password.fromHash('$2b$10$hashedpassword'),
      emailConfirmed: true,
      emailConfirmationToken: null,
      refreshTokens: [],
      passwordResetToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userRepo.findById.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ userId: userId.getValue() });

    expect(result.isFailure).toBe(false);
    expect(result.value).toEqual({
      id: userId.getValue(),
      name: 'João Silva',
      email: 'joao@example.com',
      emailConfirmed: true,
    });
    expect(result.value).not.toHaveProperty('passwordHash');
  });

  it('should return Output.fail when user not found', async () => {
    userRepo.findById.mockResolvedValue(Output.fail('User not found'));

    const result = await useCase.execute({ userId: UserId.create().getValue() });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('User not found');
  });
});
