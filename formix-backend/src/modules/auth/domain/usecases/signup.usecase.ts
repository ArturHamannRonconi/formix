import { Inject, Injectable } from '@nestjs/common';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '@modules/organizations/domain/repositories/organization.repository';
import { EmailConfirmationTokenEntity } from '@modules/users/domain/aggregate/entities/email-confirmation-token.entity';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';
import { IEmailService, EMAIL_SERVICE, EmailTemplate } from '@providers/email/email.provider';

export const JWT_SIGN_FUNCTION = 'JWT_SIGN_FUNCTION';
export const EMAIL_CONFIRMATION_EXPIRES_IN_MS = 'EMAIL_CONFIRMATION_EXPIRES_IN_MS';
export const APP_URL = 'APP_URL';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface SignupOutput {
  userId: string;
  organizationId: string;
  accessToken: string;
  emailConfirmationRequired: boolean;
}

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(JWT_SIGN_FUNCTION) private readonly jwtSign: (payload: Record<string, unknown>) => string,
    @Inject(EMAIL_CONFIRMATION_EXPIRES_IN_MS) private readonly emailConfirmationExpiresInMs: number,
    @Inject(APP_URL) private readonly appUrl: string,
  ) {}

  async execute(input: SignupInput): Promise<Output<SignupOutput>> {
    const email = Email.create(input.email);

    const emailExists = await this.userRepo.exists(email);
    if (emailExists) {
      return Output.fail('Email already in use');
    }

    const password = await Password.create(input.password);
    const user = User.create({ name: input.name, email, passwordHash: password });

    const confirmationToken = EmailConfirmationTokenEntity.create(this.emailConfirmationExpiresInMs);
    user.setEmailConfirmationToken(confirmationToken);

    const slug = Slug.fromName(input.organizationName);
    const organization = Organization.create({
      name: input.organizationName,
      slug,
      initialAdminId: user.id,
    });

    await this.userRepo.save(user);
    await this.orgRepo.save(organization);

    const confirmationUrl = `${this.appUrl}/confirm-email?token=${confirmationToken.rawToken}`;
    await this.emailService.send(input.email, EmailTemplate.EMAIL_CONFIRMATION, {
      name: input.name,
      confirmationUrl,
    });

    const accessToken = this.jwtSign({
      sub: user.id.getValue(),
      organizationId: organization.id.getValue(),
      role: 'admin',
    });

    return Output.ok({
      userId: user.id.getValue(),
      organizationId: organization.id.getValue(),
      accessToken,
      emailConfirmationRequired: true,
    });
  }
}
