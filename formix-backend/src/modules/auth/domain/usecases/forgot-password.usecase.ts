import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { PasswordResetTokenEntity } from '@modules/users/domain/aggregate/entities/password-reset-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Output } from '@shared/output';
import { IEmailService, EMAIL_SERVICE, EmailTemplate } from '@providers/email/email.provider';

export const FORGOT_PASSWORD_EXPIRES_IN_MS = 'FORGOT_PASSWORD_EXPIRES_IN_MS';
export const FORGOT_PASSWORD_APP_URL = 'FORGOT_PASSWORD_APP_URL';

export interface ForgotPasswordInput {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
    @Inject(FORGOT_PASSWORD_EXPIRES_IN_MS) private readonly expiresInMs: number,
    @Inject(FORGOT_PASSWORD_APP_URL) private readonly appUrl: string,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<Output<{ success: true }>> {
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch {
      return Output.ok({ success: true });
    }

    const result = await this.userRepo.findByEmail(email);
    if (result.isFailure) return Output.ok({ success: true });

    const user = result.value;
    const resetToken = PasswordResetTokenEntity.create(this.expiresInMs);
    user.setPasswordResetToken(resetToken);
    await this.userRepo.save(user);

    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken.rawToken}`;
    await this.emailService.send(input.email, EmailTemplate.PASSWORD_RESET, {
      name: user.name,
      resetUrl,
    });

    return Output.ok({ success: true });
  }
}
