import { LoginUseCase } from './login.usecase';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

async function createConfirmedUser() {
  const email = Email.create('test@example.com');
  const password = await Password.create('SecurePass1');
  const user = User.create({ name: 'Test', email, passwordHash: password });
  user.confirmEmail();
  return user;
}

function createOrg(userId: string) {
  const { UserId } = require('@modules/users/domain/aggregate/value-objects/user-id.vo');
  return Organization.create({
    name: 'Test Org',
    slug: Slug.fromName('Test Org'),
    initialAdminId: UserId.from(userId),
  });
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepo: { findByEmail: jest.Mock; save: jest.Mock };
  let orgRepo: { findByMemberId: jest.Mock };
  let jwtSign: jest.Mock;

  beforeEach(() => {
    userRepo = { findByEmail: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    orgRepo = { findByMemberId: jest.fn() };
    jwtSign = jest.fn().mockReturnValue('access-token');
    useCase = new LoginUseCase(userRepo as any, orgRepo as any, jwtSign, 604800000);
  });

  it('should login successfully with valid credentials', async () => {
    const user = await createConfirmedUser();
    const org = createOrg(user.id.getValue());
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));
    orgRepo.findByMemberId.mockResolvedValue([org]);

    const result = await useCase.execute({ email: 'test@example.com', password: 'SecurePass1' });

    expect(result.isFailure).toBe(false);
    expect(result.value.accessToken).toBe('access-token');
    expect(result.value.refreshToken).toBeDefined();
    expect(result.value.userId).toBe(user.id.getValue());
    expect(result.value.organizationId).toBe(org.id.getValue());
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should return failure for invalid email', async () => {
    userRepo.findByEmail.mockResolvedValue(Output.fail('User not found'));
    const result = await useCase.execute({ email: 'notfound@example.com', password: 'SecurePass1' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Invalid credentials');
  });

  it('should return failure for wrong password', async () => {
    const user = await createConfirmedUser();
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));
    orgRepo.findByMemberId.mockResolvedValue([]);

    const result = await useCase.execute({ email: 'test@example.com', password: 'WrongPass1' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Invalid credentials');
  });

  it('should return failure when email not confirmed', async () => {
    const email = Email.create('test@example.com');
    const password = await Password.create('SecurePass1');
    const unconfirmedUser = User.create({ name: 'Test', email, passwordHash: password });
    userRepo.findByEmail.mockResolvedValue(Output.ok(unconfirmedUser));

    const result = await useCase.execute({ email: 'test@example.com', password: 'SecurePass1' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Email not confirmed');
  });

  it('should return failure when no organization found', async () => {
    const user = await createConfirmedUser();
    userRepo.findByEmail.mockResolvedValue(Output.ok(user));
    orgRepo.findByMemberId.mockResolvedValue([]);

    const result = await useCase.execute({ email: 'test@example.com', password: 'SecurePass1' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('No organization found for user');
  });
});
