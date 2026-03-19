import { Inject, Injectable } from '@nestjs/common';
import { Invitation } from '../aggregate/invitation.aggregate';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '@modules/organizations/domain/repositories/organization.repository';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { Email } from '@shared/value-objects/email.vo';
import { Output } from '@shared/output';
import { IEmailService, EMAIL_SERVICE, EmailTemplate } from '@providers/email/email.provider';

export const INVITATION_EXPIRES_IN_MS = 'INVITATION_EXPIRES_IN_MS';
export const INVITATION_APP_URL = 'INVITATION_APP_URL';

export interface CreateInvitationInput {
  organizationId: string;
  requestingUserId: string;
  requestingRole: string;
  email: string;
  role?: 'member';
}

export interface CreateInvitationOutput {
  invitationId: string;
}

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY) private readonly invitationRepo: IInvitationRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(INVITATION_EXPIRES_IN_MS) private readonly expiresInMs: number,
    @Inject(INVITATION_APP_URL) private readonly appUrl: string,
  ) {}

  async execute(input: CreateInvitationInput): Promise<Output<CreateInvitationOutput>> {
    if (input.requestingRole !== 'admin') {
      return Output.fail('Only admins can send invitations');
    }

    const normalizedEmail = input.email.toLowerCase();

    const pendingInvitation = await this.invitationRepo.findPendingByEmailAndOrg(
      normalizedEmail,
      input.organizationId,
    );
    if (pendingInvitation) {
      return Output.fail('Invitation already pending for this email');
    }

    let email: Email;
    try {
      email = Email.create(normalizedEmail);
    } catch {
      return Output.fail('Invalid email');
    }

    const userResult = await this.userRepo.findByEmail(email);
    if (!userResult.isFailure) {
      const existingUser = userResult.value;
      const orgResult = await this.orgRepo.findById(OrganizationId.from(input.organizationId));
      if (!orgResult.isFailure) {
        const org = orgResult.value;
        const member = org.findMemberByUserId(existingUser.id);
        if (member) {
          return Output.fail('User is already a member of this organization');
        }
      }
    }

    const orgResult = await this.orgRepo.findById(OrganizationId.from(input.organizationId));
    if (orgResult.isFailure) {
      return Output.fail('Organization not found');
    }
    const org = orgResult.value;

    const invitation = Invitation.create({
      organizationId: input.organizationId,
      email: normalizedEmail,
      role: input.role ?? 'member',
      expiresInMs: this.expiresInMs,
    });

    await this.invitationRepo.save(invitation);

    const inviteLink = `${this.appUrl}/invite?token=${invitation.rawToken}`;
    await this.emailService.send(normalizedEmail, EmailTemplate.INVITATION, {
      inviteeName: normalizedEmail,
      organizationName: org.name,
      inviteLink,
    });

    return Output.ok({ invitationId: invitation.id.getValue() });
  }
}
