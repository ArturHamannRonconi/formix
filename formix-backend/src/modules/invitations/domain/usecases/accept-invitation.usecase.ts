import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '@modules/organizations/domain/repositories/organization.repository';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { RefreshTokenEntity } from '@modules/users/domain/aggregate/entities/refresh-token.entity';
import { Output } from '@shared/output';

export const ACCEPT_INVITATION_JWT_SIGN_FUNCTION = 'ACCEPT_INVITATION_JWT_SIGN_FUNCTION';
export const ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS = 'ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS';

export interface AcceptInvitationInput {
  token: string;
  name?: string;
  password?: string;
}

export interface AcceptInvitationOutput {
  accessToken: string;
  refreshToken: string;
  userId: string;
  organizationId: string;
}

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject(INVITATION_REPOSITORY) private readonly invitationRepo: IInvitationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    @Inject(ACCEPT_INVITATION_JWT_SIGN_FUNCTION) private readonly jwtSign: (payload: Record<string, unknown>) => string,
    @Inject(ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS) private readonly refreshTokenExpiresInMs: number,
  ) {}

  async execute(input: AcceptInvitationInput): Promise<Output<AcceptInvitationOutput>> {
    const tokenHash = createHash('sha256').update(input.token).digest('hex');
    const invitationResult = await this.invitationRepo.findByTokenHash(tokenHash);

    if (invitationResult.isFailure) {
      return Output.fail('Invalid or expired invitation');
    }

    const invitation = invitationResult.value;

    if (!invitation.isPending() || invitation.isExpired()) {
      return Output.fail('Invalid or expired invitation');
    }

    const email = Email.create(invitation.email);
    const userResult = await this.userRepo.findByEmail(email);

    let user: User;

    if (userResult.isFailure) {
      if (!input.name || !input.password) {
        return Output.fail('Name and password are required for new users');
      }
      let password: Password;
      try {
        password = await Password.create(input.password);
      } catch {
        return Output.fail('Invalid password');
      }
      user = User.create({ name: input.name, email, passwordHash: password });
      user.confirmEmail();
    } else {
      user = userResult.value;
    }

    const orgResult = await this.orgRepo.findById(OrganizationId.from(invitation.organizationId));
    if (orgResult.isFailure) {
      return Output.fail('Organization not found');
    }
    const org = orgResult.value;

    try {
      org.addMember(user.id, invitation.role as any);
    } catch {
      // User might already be a member — continue
    }

    invitation.accept();

    const refreshToken = RefreshTokenEntity.create(this.refreshTokenExpiresInMs);
    user.addRefreshToken(refreshToken);

    await this.userRepo.save(user);
    await this.invitationRepo.save(invitation);
    await this.orgRepo.save(org);

    const accessToken = this.jwtSign({
      sub: user.id.getValue(),
      organizationId: org.id.getValue(),
      role: invitation.role,
    });

    return Output.ok({
      accessToken,
      refreshToken: refreshToken.rawToken!,
      userId: user.id.getValue(),
      organizationId: org.id.getValue(),
    });
  }
}
