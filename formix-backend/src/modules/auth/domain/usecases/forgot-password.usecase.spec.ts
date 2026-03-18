import { ForgotPasswordUseCase } from './forgot-password.usecase';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function createUser() {
  const email = Email.create('test@example.com');
  const password = await Password.create('SecurePass1');
  return User.create({ name: 'Test', email, passwordHash: password });
}

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepo: { findByEmail: jest.Mock; save: jest.Mock };
  let emailService: { send: jest.Mock };

  beforeEach(() => {
    userRepo = { findByEmail: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    emailService = { send: jest.fn().mockResolvedValue(undefined) };
    useCase = new ForgotPasswordUseCase(userRepo as any, emailService as any, 3600000, 'http://localhost:3000');
  });

  it('should send password reset email for existing user', async () => {
    const user = await createUser();
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.isFailure).toBe(false);
    expect(result.value.success).toBe(true);
    expect(userRepo.save).toHaveBeenCalled();
    expect(emailService.send).toHaveBeenCalled();
    expect(user.passwordResetToken).not.toBeNull();
  });

  it('should return success silently when email not found', async () => {
    userRepo.findByEmail.mockResolvedValue(Output.fail('User not found'));

    const result = await useCase.execute({ email: 'notfound@example.com' });
    expect(result.isFailure).toBe(false);
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('should return success silently for invalid email', async () => {
    const result = await useCase.execute({ email: 'not-an-email' });
    expect(result.isFailure).toBe(false);
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });
});
