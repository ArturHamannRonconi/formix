import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { Output } from '@shared/output';

export interface ListMembersInput {
  organizationId: string;
}

export interface MemberDto {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
}

export interface ListMembersOutput {
  members: MemberDto[];
}

@Injectable()
export class ListMembersUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListMembersInput): Promise<Output<ListMembersOutput>> {
    const orgResult = await this.orgRepo.findById(OrganizationId.from(input.organizationId));
    if (orgResult.isFailure) return Output.fail(orgResult.errorMessage);

    const org = orgResult.value;
    const members: MemberDto[] = [];

    for (const membership of org.members) {
      const userResult = await this.userRepo.findById(membership.userId);
      if (userResult.isFailure) continue;

      const user = userResult.value;
      members.push({
        userId: membership.userId.getValue(),
        name: user.name,
        email: user.email.getValue(),
        role: membership.role,
        joinedAt: membership.createdAt,
      });
    }

    return Output.ok({ members });
  }
}
