import { ListMembersUseCase } from './list-members.usecase';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
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
import { Output } from '@shared/output';

function makeOrg(memberUserIds: Array<{ userId: UserId; role: MemberRole }>): Organization {
  const orgId = OrganizationId.create();
  const members = memberUserIds.map(({ userId, role }) =>
    MembershipEntity.reconstitute({
      id: MembershipId.create(),
      userId,
      role,
      createdAt: new Date('2026-01-15T10:00:00.000Z'),
    }),
  );
  return Organization.reconstitute({
    id: orgId,
    name: 'Test Org',
    slug: Slug.create('test-org'),
    members,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUser(userId: UserId, name: string, email: string): User {
  return User.reconstitute({
    id: userId,
    name,
    email: Email.create(email),
    passwordHash: Password.fromHash('$2b$10$hash'),
    emailConfirmed: true,
    emailConfirmationToken: null,
    refreshTokens: [],
    passwordResetToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('ListMembersUseCase', () => {
  let useCase: ListMembersUseCase;
  let orgRepo: jest.Mocked<IOrganizationRepository>;
  let userRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    orgRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByMemberId: jest.fn(),
      existsBySlug: jest.fn(),
    };
    userRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailConfirmationTokenHash: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByPasswordResetTokenHash: jest.fn(),
      exists: jest.fn(),
    };
    useCase = new ListMembersUseCase(orgRepo, userRepo);
  });

  it('should return members with user data', async () => {
    const userId1 = UserId.create();
    const userId2 = UserId.create();
    const org = makeOrg([
      { userId: userId1, role: MemberRole.ADMIN },
      { userId: userId2, role: MemberRole.MEMBER },
    ]);
    const user1 = makeUser(userId1, 'Alice', 'alice@example.com');
    const user2 = makeUser(userId2, 'Bob', 'bob@example.com');

    orgRepo.findById.mockResolvedValue(Output.ok(org));
    userRepo.findById
      .mockResolvedValueOnce(Output.ok(user1))
      .mockResolvedValueOnce(Output.ok(user2));

    const result = await useCase.execute({ organizationId: org.id.getValue() });

    expect(result.isFailure).toBe(false);
    expect(result.value.members).toHaveLength(2);
    expect(result.value.members[0]).toMatchObject({
      userId: userId1.getValue(),
      name: 'Alice',
      email: 'alice@example.com',
      role: MemberRole.ADMIN,
    });
    expect(result.value.members[0].joinedAt).toBeDefined();
    expect(result.value.members[0]).not.toHaveProperty('passwordHash');
  });

  it('should return Output.fail when organization not found', async () => {
    orgRepo.findById.mockResolvedValue(Output.fail('Organization not found'));

    const result = await useCase.execute({ organizationId: OrganizationId.create().getValue() });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Organization not found');
  });

  it('should not return members from another organization', async () => {
    const userId = UserId.create();
    const org = makeOrg([{ userId, role: MemberRole.ADMIN }]);
    const user = makeUser(userId, 'Alice', 'alice@example.com');

    orgRepo.findById.mockResolvedValue(Output.ok(org));
    userRepo.findById.mockResolvedValue(Output.ok(user));

    const result = await useCase.execute({ organizationId: org.id.getValue() });

    expect(result.isFailure).toBe(false);
    expect(result.value.members).toHaveLength(1);
  });
});
