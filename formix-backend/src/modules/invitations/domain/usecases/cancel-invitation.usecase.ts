import { Inject, Injectable } from '@nestjs/common';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository';
import { InvitationId } from '../aggregate/value-objects/invitation-id.vo';
import { Output } from '@shared/output';

export interface CancelInvitationInput {
  organizationId: string;
  invitationId: string;
  requestingRole: string;
}

@Injectable()
export class CancelInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY) private readonly invitationRepo: IInvitationRepository,
  ) {}

  async execute(input: CancelInvitationInput): Promise<Output<{ cancelled: true }>> {
    if (input.requestingRole !== 'admin') {
      return Output.fail('Only admins can cancel invitations');
    }

    let invitationId: InvitationId;
    try {
      invitationId = InvitationId.from(input.invitationId);
    } catch {
      return Output.fail('Invitation not found');
    }

    const result = await this.invitationRepo.findById(invitationId);
    if (result.isFailure) return Output.fail('Invitation not found');

    const invitation = result.value;
    if (invitation.organizationId !== input.organizationId) {
      return Output.fail('Invitation not found');
    }

    if (!invitation.isPending()) {
      return Output.fail('Invitation is not pending');
    }

    invitation.cancel();
    await this.invitationRepo.save(invitation);

    return Output.ok({ cancelled: true });
  }
}
