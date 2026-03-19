import { SignupUseCase } from './signup.usecase';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { IEmailService, EmailTemplate } from '@providers/email/email.provider';

describe('SignupUseCase', () => {
  let usecase: SignupUseCase;
  let userRepo: jest.Mocked<IUserRepository>;
  let orgRepo: jest.Mocked<IOrganizationRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let jwtSign: jest.Mock;

  beforeEach(() => {
    userRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailConfirmationTokenHash: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByPasswordResetTokenHash: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
    };
    orgRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByMemberId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      existsBySlug: jest.fn().mockResolvedValue(false),
    };
    emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };
    jwtSign = jest.fn().mockReturnValue('mock-access-token');

    usecase = new SignupUseCase(
      userRepo,
      orgRepo,
      emailService,
      jwtSign,
      86400000,
      'http://localhost:3000',
    );
  });

  it('should create user with confirmation token, create organization and send email', async () => {
    const output = await usecase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass1',
      organizationName: 'Acme Corp',
    });

    expect(output.isFailure).toBe(false);
    expect(userRepo.save).toHaveBeenCalledTimes(1);
    expect(orgRepo.save).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledWith(
      'john@example.com',
      EmailTemplate.EMAIL_CONFIRMATION,
      expect.objectContaining({ name: 'John Doe', confirmationUrl: expect.any(String) }),
    );
    expect(output.value.accessToken).toBe('mock-access-token');
    expect(output.value.emailConfirmationRequired).toBe(true);
    expect(output.value.userId).toBeDefined();
    expect(output.value.organizationId).toBeDefined();
  });

  it('should save user with emailConfirmationToken set', async () => {
    await usecase.execute({
      name: 'John',
      email: 'john@example.com',
      password: 'SecurePass1',
      organizationName: 'Acme',
    });

    const savedUser = (userRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedUser.emailConfirmationToken).not.toBeNull();
  });

  it('should return Output.fail when email already exists', async () => {
    userRepo.exists.mockResolvedValue(true);

    const output = await usecase.execute({
      name: 'John',
      email: 'john@example.com',
      password: 'SecurePass1',
      organizationName: 'Acme',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Email already in use');
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(orgRepo.save).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('should sign JWT with userId, organizationId and role', async () => {
    await usecase.execute({
      name: 'John',
      email: 'john@example.com',
      password: 'SecurePass1',
      organizationName: 'Acme',
    });

    expect(jwtSign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: expect.any(String),
        organizationId: expect.any(String),
        role: 'admin',
      }),
    );
  });
});
