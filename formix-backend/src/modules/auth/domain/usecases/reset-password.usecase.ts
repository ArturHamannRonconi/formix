import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<Output<{ success: true }>> {
    const hash = createHash('sha256').update(input.token).digest('hex');
    const result = await this.userRepo.findByPasswordResetTokenHash(hash);
    if (result.isFailure) return Output.fail('Invalid or expired token');

    const user = result.value;
    if (!user.passwordResetToken) return Output.fail('Invalid or expired token');
    if (user.passwordResetToken.isExpired()) return Output.fail('Token expired');

    let newPassword: Password;
    try {
      newPassword = await Password.create(input.newPassword);
    } catch {
      return Output.fail('Invalid password');
    }

    user.updatePassword(newPassword);
    user.invalidateAllRefreshTokens();
    await this.userRepo.save(user);
    return Output.ok({ success: true });
  }
}
