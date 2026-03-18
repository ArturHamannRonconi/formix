import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';
import { Output } from '@shared/output';

export interface RemoveMemberInput {
  organizationId: string;
  requestingUserId: string;
  targetUserId: string;
}

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
  ) {}

  async execute(input: RemoveMemberInput): Promise<Output<{ removed: true }>> {
    const orgResult = await this.orgRepo.findById(OrganizationId.from(input.organizationId));
    if (orgResult.isFailure) return Output.fail(orgResult.errorMessage);

    const org = orgResult.value;
    const requestingId = UserId.from(input.requestingUserId);
    const targetId = UserId.from(input.targetUserId);

    const requester = org.findMemberByUserId(requestingId);
    if (!requester || requester.role !== MemberRole.ADMIN) {
      return Output.fail('Only admins can remove members');
    }

    const target = org.findMemberByUserId(targetId);
    if (!target) {
      return Output.fail('Member not found in this organization');
    }

    try {
      org.removeMember(targetId);
    } catch (e: unknown) {
      return Output.fail((e as Error).message);
    }

    await this.orgRepo.save(org);
    return Output.ok({ removed: true });
  }
}
