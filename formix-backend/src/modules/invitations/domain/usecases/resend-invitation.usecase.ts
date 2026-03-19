import { Inject, Injectable } from '@nestjs/common';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository';
import { InvitationId } from '../aggregate/value-objects/invitation-id.vo';
import { IEmailService, EMAIL_SERVICE, EmailTemplate } from '@providers/email/email.provider';
import { Output } from '@shared/output';

export const RESEND_INVITATION_EXPIRES_IN_MS = 'RESEND_INVITATION_EXPIRES_IN_MS';
export const RESEND_INVITATION_APP_URL = 'RESEND_INVITATION_APP_URL';

export interface ResendInvitationInput {
  organizationId: string;
  invitationId: string;
  requestingRole: string;
}

@Injectable()
export class ResendInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY) private readonly invitationRepo: IInvitationRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(RESEND_INVITATION_EXPIRES_IN_MS) private readonly expiresInMs: number,
    @Inject(RESEND_INVITATION_APP_URL) private readonly appUrl: string,
  ) {}

  async execute(input: ResendInvitationInput): Promise<Output<{ resent: true }>> {
    if (input.requestingRole !== 'admin') {
      return Output.fail('Only admins can resend invitations');
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

    invitation.renewToken(this.expiresInMs);
    await this.invitationRepo.save(invitation);

    const inviteLink = `${this.appUrl}/invite?token=${invitation.rawToken}`;
    await this.emailService.send(invitation.email, EmailTemplate.INVITATION, {
      inviteeName: invitation.email,
      organizationName: '',
      inviteLink,
    });

    return Output.ok({ resent: true });
  }
}
