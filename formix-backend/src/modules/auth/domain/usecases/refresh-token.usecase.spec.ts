import { RefreshTokenUseCase } from './refresh-token.usecase';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { RefreshTokenEntity } from '@modules/users/domain/aggregate/entities/refresh-token.entity';
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepo: { findByRefreshTokenHash: jest.Mock; save: jest.Mock };
  let orgRepo: { findByMemberId: jest.Mock };
  let jwtSign: jest.Mock;
  let jwtRefreshSign: jest.Mock;

  beforeEach(() => {
    userRepo = {
      findByRefreshTokenHash: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    orgRepo = { findByMemberId: jest.fn() };
    jwtSign = jest.fn().mockReturnValue('new-access-token');
    jwtRefreshSign = jest.fn().mockReturnValue('new-refresh-token-jwt');
    useCase = new RefreshTokenUseCase(userRepo as any, orgRepo as any, jwtSign, jwtRefreshSign, 604800000);
  });

  it('should issue new tokens with valid refresh token', async () => {
    const user = await createConfirmedUser();
    const token = RefreshTokenEntity.create(86400000);
    user.addRefreshToken(token);
    const org = createOrg(user.id.getValue());

    userRepo.findByRefreshTokenHash.mockResolvedValue(Output.ok(user));
    orgRepo.findByMemberId.mockResolvedValue([org]);

    const result = await useCase.execute({ refreshToken: token.rawToken! });

    expect(result.isFailure).toBe(false);
    expect(result.value.accessToken).toBe('new-access-token');
    expect(result.value.refreshToken).toBeDefined();
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should return failure for invalid refresh token', async () => {
    userRepo.findByRefreshTokenHash.mockResolvedValue(Output.fail('User not found'));
    const result = await useCase.execute({ refreshToken: 'invalid-token' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Invalid or expired refresh token');
  });

  it('should detect token reuse and invalidate family', async () => {
    const user = await createConfirmedUser();
    const token = RefreshTokenEntity.create(86400000);
    token.markAsUsed();
    user.addRefreshToken(token);

    userRepo.findByRefreshTokenHash.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ refreshToken: token.rawToken! });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Refresh token already used');
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should return failure for expired refresh token', async () => {
    const user = await createConfirmedUser();
    const token = RefreshTokenEntity.create(-1000);
    user.addRefreshToken(token);

    userRepo.findByRefreshTokenHash.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ refreshToken: token.rawToken! });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Refresh token expired');
  });
});
