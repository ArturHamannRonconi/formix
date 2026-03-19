import { createHash } from 'crypto';
import { AcceptInvitationUseCase } from './accept-invitation.usecase';
import { IInvitationRepository } from '../repositories/invitation.repository';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { Invitation } from '../aggregate/invitation.aggregate';
import { Output } from '@shared/output';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { MembershipEntity } from '@modules/organizations/domain/aggregate/entities/membership.entity';
import { MembershipId } from '@modules/organizations/domain/aggregate/value-objects/membership-id.vo';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';

const makeOrg = (adminId: UserId) =>
  Organization.reconstitute({
    id: OrganizationId.create(),
    name: 'Test Org',
    slug: Slug.create('test-org'),
    members: [
      MembershipEntity.reconstitute({
        id: MembershipId.create(),
        userId: adminId,
        role: MemberRole.ADMIN,
        createdAt: new Date(),
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('AcceptInvitationUseCase', () => {
  let usecase: AcceptInvitationUseCase;
  let invitationRepo: jest.Mocked<IInvitationRepository>;
  let userRepo: jest.Mocked<IUserRepository>;
  let orgRepo: jest.Mocked<IOrganizationRepository>;
  let jwtSign: jest.Mock;

  const adminId = UserId.create();

  const makePendingInvitation = (email = 'invited@example.com') =>
    Invitation.create({
      organizationId: 'org-id',
      email,
      expiresInMs: 604800000,
    });

  beforeEach(async () => {
    invitationRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTokenHash: jest.fn(),
      findByOrganizationId: jest.fn(),
      findPendingByEmailAndOrg: jest.fn(),
      delete: jest.fn(),
    };
    userRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailConfirmationTokenHash: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByPasswordResetTokenHash: jest.fn(),
      exists: jest.fn(),
    };
    orgRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByMemberId: jest.fn(),
      existsBySlug: jest.fn(),
    };
    jwtSign = jest.fn().mockReturnValue('access-token');

    usecase = new AcceptInvitationUseCase(
      invitationRepo,
      userRepo,
      orgRepo,
      jwtSign,
      604800000,
    );
  });

  it('should accept invitation for existing user', async () => {
    const invitation = makePendingInvitation();
    const tokenHash = createHash('sha256').update(invitation.rawToken!).digest('hex');
    invitationRepo.findByTokenHash.mockResolvedValue(Output.ok(invitation));

    const existingUser = await buildUser('invited@example.com');
    userRepo.findByEmail.mockResolvedValue(Output.ok(existingUser));

    const org = makeOrg(adminId);
    orgRepo.findById.mockResolvedValue(Output.ok(org));
    orgRepo.save.mockResolvedValue(undefined);

    const output = await usecase.execute({ token: invitation.rawToken! });

    expect(output.isFailure).toBe(false);
    expect(output.value.accessToken).toBeDefined();
    expect(output.value.refreshToken).toBeDefined();
    expect(invitationRepo.save).toHaveBeenCalled();
    expect(orgRepo.save).toHaveBeenCalled();
  });

  it('should accept invitation for new user and create account', async () => {
    const invitation = makePendingInvitation('newuser@example.com');
    invitationRepo.findByTokenHash.mockResolvedValue(Output.ok(invitation));
    userRepo.findByEmail.mockResolvedValue(Output.fail('User not found'));

    const org = makeOrg(adminId);
    orgRepo.findById.mockResolvedValue(Output.ok(org));
    orgRepo.save.mockResolvedValue(undefined);

    const output = await usecase.execute({
      token: invitation.rawToken!,
      name: 'New User',
      password: 'SecurePass1',
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.accessToken).toBeDefined();
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should fail if name and password are missing for new user', async () => {
    const invitation = makePendingInvitation('newuser@example.com');
    invitationRepo.findByTokenHash.mockResolvedValue(Output.ok(invitation));
    userRepo.findByEmail.mockResolvedValue(Output.fail('User not found'));

    const output = await usecase.execute({ token: invitation.rawToken! });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Name and password are required for new users');
  });

  it('should fail if token is invalid', async () => {
    invitationRepo.findByTokenHash.mockResolvedValue(Output.fail('Invitation not found'));

    const output = await usecase.execute({ token: 'invalid-token' });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invalid or expired invitation');
  });

  it('should fail if invitation is expired', async () => {
    const invitation = makePendingInvitation();
    const expiredInvitation = Invitation.reconstitute({
      id: invitation.id,
      organizationId: invitation.organizationId,
      email: invitation.email,
      tokenHash: invitation.tokenHash,
      role: invitation.role,
      status: invitation.status,
      expiresAt: new Date(Date.now() - 1000),
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    });
    invitationRepo.findByTokenHash.mockResolvedValue(Output.ok(expiredInvitation));

    const output = await usecase.execute({ token: invitation.rawToken! });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invalid or expired invitation');
  });

  it('should fail if invitation is already accepted', async () => {
    const invitation = makePendingInvitation();
    invitation.accept();
    invitationRepo.findByTokenHash.mockResolvedValue(Output.ok(invitation));

    const output = await usecase.execute({ token: 'some-token' });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invalid or expired invitation');
  });
});

async function buildUser(emailStr: string): Promise<User> {
  return User.create({
    name: 'Existing User',
    email: Email.create(emailStr),
    passwordHash: await Password.create('ExistingPass1'),
  });
}
