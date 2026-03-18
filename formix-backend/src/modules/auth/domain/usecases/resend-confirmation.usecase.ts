import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { EmailConfirmationTokenEntity } from '@modules/users/domain/aggregate/entities/email-confirmation-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Output } from '@shared/output';
import { IEmailService, EMAIL_SERVICE, EmailTemplate } from '@shared/email/email-service.interface';

export const RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS = 'RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS';
export const RESEND_APP_URL = 'RESEND_APP_URL';

export interface ResendConfirmationInput {
  email: string;
}

@Injectable()
export class ResendConfirmationUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(RESEND_EMAIL_CONFIRMATION_EXPIRES_IN_MS) private readonly expiresInMs: number,
    @Inject(RESEND_APP_URL) private readonly appUrl: string,
  ) {}

  async execute(input: ResendConfirmationInput): Promise<Output<{ success: true }>> {
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch {
      return Output.ok({ success: true });
    }

    const result = await this.userRepo.findByEmail(email);
    if (result.isFailure) return Output.ok({ success: true });

    const user = result.value;
    if (user.emailConfirmed) return Output.ok({ success: true });

    const newToken = EmailConfirmationTokenEntity.create(this.expiresInMs);
    user.setEmailConfirmationToken(newToken);
    await this.userRepo.save(user);

    const confirmationUrl = `${this.appUrl}/confirm-email?token=${newToken.rawToken}`;
    await this.emailService.send(input.email, EmailTemplate.EMAIL_CONFIRMATION, {
      name: user.name,
      confirmationUrl,
    });

    return Output.ok({ success: true });
  }
}
