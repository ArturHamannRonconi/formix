import { ResendConfirmationUseCase } from './resend-confirmation.usecase';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function createUser(confirmed = false) {
  const email = Email.create('test@example.com');
  const password = await Password.create('SecurePass1');
  const user = User.create({ name: 'Test', email, passwordHash: password });
  if (confirmed) user.confirmEmail();
  return user;
}

describe('ResendConfirmationUseCase', () => {
  let useCase: ResendConfirmationUseCase;
  let userRepo: { findByEmail: jest.Mock; save: jest.Mock };
  let emailService: { send: jest.Mock };

  beforeEach(() => {
    userRepo = { findByEmail: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    emailService = { send: jest.fn().mockResolvedValue(undefined) };
    useCase = new ResendConfirmationUseCase(userRepo as any, emailService as any, 86400000, 'http://localhost:3000');
  });

  it('should resend confirmation email for unconfirmed user', async () => {
    const user = await createUser();
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ email: 'test@example.com' });

    expect(result.isFailure).toBe(false);
    expect(result.value.success).toBe(true);
    expect(userRepo.save).toHaveBeenCalled();
    expect(emailService.send).toHaveBeenCalled();
  });

  it('should return success silently when email not found', async () => {
    userRepo.findByEmail.mockResolvedValue(Output.fail('User not found'));

    const result = await useCase.execute({ email: 'notfound@example.com' });
    expect(result.isFailure).toBe(false);
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('should return success silently when email already confirmed', async () => {
    const user = await createUser(true);
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ email: 'test@example.com' });
    expect(result.isFailure).toBe(false);
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });
});
