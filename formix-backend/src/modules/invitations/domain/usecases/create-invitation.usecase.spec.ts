import { CreateInvitationUseCase } from './create-invitation.usecase';
import { IInvitationRepository } from '../repositories/invitation.repository';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { IEmailService } from '@shared/email/email-service.interface';
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

const makeOrg = (adminId: UserId, extraMemberEmail?: string, extraMemberId?: UserId) => {
  const members: MembershipEntity[] = [
    MembershipEntity.reconstitute({
      id: MembershipId.create(),
      userId: adminId,
      role: MemberRole.ADMIN,
      createdAt: new Date(),
    }),
  ];
  if (extraMemberId) {
    members.push(
      MembershipEntity.reconstitute({
        id: MembershipId.create(),
        userId: extraMemberId,
        role: MemberRole.MEMBER,
        createdAt: new Date(),
      }),
    );
  }
  return Organization.reconstitute({
    id: OrganizationId.create(),
    name: 'Test Org',
    slug: Slug.create('test-org'),
    members,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe('CreateInvitationUseCase', () => {
  let usecase: CreateInvitationUseCase;
  let invitationRepo: jest.Mocked<IInvitationRepository>;
  let orgRepo: jest.Mocked<IOrganizationRepository>;
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;

  const adminId = UserId.create();
  const org = makeOrg(adminId);

  beforeEach(() => {
    invitationRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTokenHash: jest.fn(),
      findByOrganizationId: jest.fn(),
      findPendingByEmailAndOrg: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };
    orgRepo = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(Output.ok(org)),
      findBySlug: jest.fn(),
      findByMemberId: jest.fn(),
      existsBySlug: jest.fn(),
    };
    userRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(Output.fail('User not found')),
      findByEmailConfirmationTokenHash: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByPasswordResetTokenHash: jest.fn(),
      exists: jest.fn().mockResolvedValue(false),
    };
    emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    usecase = new CreateInvitationUseCase(
      invitationRepo,
      orgRepo,
      userRepo,
      emailService,
      604800000,
      'http://localhost:3000',
    );
  });

  it('should create invitation successfully for non-existing user', async () => {
    const output = await usecase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      requestingRole: 'admin',
      email: 'newuser@example.com',
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.invitationId).toBeDefined();
    expect(invitationRepo.save).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledTimes(1);
  });

  it('should fail if requester is not admin', async () => {
    const output = await usecase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      requestingRole: 'member',
      email: 'newuser@example.com',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Only admins can send invitations');
  });

  it('should fail if email already has a pending invitation', async () => {
    invitationRepo.findPendingByEmailAndOrg.mockResolvedValue({} as any);

    const output = await usecase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      requestingRole: 'admin',
      email: 'pending@example.com',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Invitation already pending for this email');
  });

  it('should fail if email is already a member of the organization', async () => {
    const existingMemberId = UserId.create();
    const memberOrg = makeOrg(adminId, 'member@example.com', existingMemberId);
    orgRepo.findById.mockResolvedValue(Output.ok(memberOrg));

    const existingMemberUser = {} as User;
    Object.defineProperty(existingMemberUser, 'id', { get: () => existingMemberId });
    userRepo.findByEmail.mockResolvedValue(Output.ok(existingMemberUser));

    const output = await usecase.execute({
      organizationId: memberOrg.id.getValue(),
      requestingUserId: adminId.getValue(),
      requestingRole: 'admin',
      email: 'member@example.com',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('User is already a member of this organization');
  });

  it('should send email with invite link containing rawToken', async () => {
    await usecase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      requestingRole: 'admin',
      email: 'newuser@example.com',
    });

    expect(emailService.send).toHaveBeenCalledWith(
      'newuser@example.com',
      expect.anything(),
      expect.objectContaining({ inviteLink: expect.stringContaining('http://localhost:3000/invite?token=') }),
    );
  });
});
