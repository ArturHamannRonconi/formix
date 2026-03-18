import { UpdateProfileUseCase } from './update-profile.usecase';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function makeUser(passwordPlain = 'DefaultPass1'): Promise<User> {
  return User.reconstitute({
    id: UserId.create(),
    name: 'Test User',
    email: Email.create('test@example.com'),
    passwordHash: await Password.create(passwordPlain),
    emailConfirmed: false,
    emailConfirmationToken: null,
    refreshTokens: [],
    passwordResetToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
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
    useCase = new UpdateProfileUseCase(userRepo);
  });

  it('should update name successfully', async () => {
    const user = await makeUser();
    userRepo.findById.mockResolvedValue(Output.ok(user));
    userRepo.save.mockResolvedValue();

    const result = await useCase.execute({ userId: user.id.getValue(), name: 'New Name' });

    expect(result.isFailure).toBe(false);
    expect(result.value).toEqual({ updated: true });
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should update password with correct current password', async () => {
    const user = await makeUser('CurrentPass1');
    userRepo.findById.mockResolvedValue(Output.ok(user));
    userRepo.save.mockResolvedValue();

    const result = await useCase.execute({
      userId: user.id.getValue(),
      currentPassword: 'CurrentPass1',
      newPassword: 'NewPass1234',
    });

    expect(result.isFailure).toBe(false);
    expect(result.value).toEqual({ updated: true });
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should fail when current password is incorrect', async () => {
    const user = await makeUser('CurrentPass1');
    userRepo.findById.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({
      userId: user.id.getValue(),
      currentPassword: 'WrongPass1',
      newPassword: 'NewPass1234',
    });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Current password is incorrect');
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when newPassword is provided without currentPassword', async () => {
    const user = await makeUser();
    userRepo.findById.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({
      userId: user.id.getValue(),
      newPassword: 'NewPass1234',
    });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Current password is required to change password');
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('should return Output.fail when user not found', async () => {
    userRepo.findById.mockResolvedValue(Output.fail('User not found'));

    const result = await useCase.execute({ userId: UserId.create().getValue(), name: 'New Name' });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('User not found');
  });

  it('should not change email even when updating', async () => {
    const user = await makeUser();
    const originalEmail = user.email.getValue();
    userRepo.findById.mockResolvedValue(Output.ok(user));
    userRepo.save.mockResolvedValue();

    await useCase.execute({ userId: user.id.getValue(), name: 'New Name' });

    expect(user.email.getValue()).toBe(originalEmail);
  });
});
