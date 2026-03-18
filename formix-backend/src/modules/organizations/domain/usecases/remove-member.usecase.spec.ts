import { RemoveMemberUseCase } from './remove-member.usecase';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { MembershipEntity } from '@modules/organizations/domain/aggregate/entities/membership.entity';
import { MembershipId } from '@modules/organizations/domain/aggregate/value-objects/membership-id.vo';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';
import { Output } from '@shared/output';

function makeOrg(admin: UserId, member?: UserId): Organization {
  const members: MembershipEntity[] = [
    MembershipEntity.reconstitute({
      id: MembershipId.create(),
      userId: admin,
      role: MemberRole.ADMIN,
      createdAt: new Date(),
    }),
  ];
  if (member) {
    members.push(
      MembershipEntity.reconstitute({
        id: MembershipId.create(),
        userId: member,
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
}

describe('RemoveMemberUseCase', () => {
  let useCase: RemoveMemberUseCase;
  let orgRepo: jest.Mocked<IOrganizationRepository>;

  beforeEach(() => {
    orgRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByMemberId: jest.fn(),
      existsBySlug: jest.fn(),
    };
    useCase = new RemoveMemberUseCase(orgRepo);
  });

  it('should remove a member when requested by admin', async () => {
    const adminId = UserId.create();
    const memberId = UserId.create();
    const org = makeOrg(adminId, memberId);
    orgRepo.findById.mockResolvedValue(Output.ok(org));
    orgRepo.save.mockResolvedValue();

    const result = await useCase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      targetUserId: memberId.getValue(),
    });

    expect(result.isFailure).toBe(false);
    expect(result.value).toEqual({ removed: true });
    expect(orgRepo.save).toHaveBeenCalled();
  });

  it('should fail when requesting user is not admin', async () => {
    const adminId = UserId.create();
    const memberId = UserId.create();
    const org = makeOrg(adminId, memberId);
    orgRepo.findById.mockResolvedValue(Output.ok(org));

    const result = await useCase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: memberId.getValue(),
      targetUserId: adminId.getValue(),
    });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Only admins can remove members');
    expect(orgRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when admin tries to remove themselves as the last admin', async () => {
    const adminId = UserId.create();
    const org = makeOrg(adminId);
    orgRepo.findById.mockResolvedValue(Output.ok(org));

    const result = await useCase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      targetUserId: adminId.getValue(),
    });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Cannot remove the last admin of an organization');
    expect(orgRepo.save).not.toHaveBeenCalled();
  });

  it('should fail when target member not found in organization', async () => {
    const adminId = UserId.create();
    const nonMemberId = UserId.create();
    const org = makeOrg(adminId);
    orgRepo.findById.mockResolvedValue(Output.ok(org));

    const result = await useCase.execute({
      organizationId: org.id.getValue(),
      requestingUserId: adminId.getValue(),
      targetUserId: nonMemberId.getValue(),
    });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Member not found in this organization');
    expect(orgRepo.save).not.toHaveBeenCalled();
  });

  it('should return Output.fail when organization not found', async () => {
    orgRepo.findById.mockResolvedValue(Output.fail('Organization not found'));

    const result = await useCase.execute({
      organizationId: OrganizationId.create().getValue(),
      requestingUserId: UserId.create().getValue(),
      targetUserId: UserId.create().getValue(),
    });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Organization not found');
  });
});
