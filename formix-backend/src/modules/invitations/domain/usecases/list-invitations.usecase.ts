import { Inject, Injectable } from '@nestjs/common';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository';
import { Output } from '@shared/output';

export interface ListInvitationsInput {
  organizationId: string;
}

export interface InvitationDto {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ListInvitationsOutput {
  invitations: InvitationDto[];
}

@Injectable()
export class ListInvitationsUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY) private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(input: ListInvitationsInput): Promise<Output<ListInvitationsOutput>> {
    const invitations = await this.invitationRepo.findByOrganizationId(input.organizationId);
    return Output.ok({
      invitations: invitations.map(inv => ({
        id: inv.id.getValue(),
        email: inv.email,
        role: inv.role,
        status: inv.status.getValue(),
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    });
  }
}
