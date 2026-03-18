import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { Output } from '@shared/output';

export interface ConfirmEmailInput {
  token: string;
}

@Injectable()
export class ConfirmEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ConfirmEmailInput): Promise<Output<{ success: true }>> {
    const hash = createHash('sha256').update(input.token).digest('hex');
    const result = await this.userRepo.findByEmailConfirmationTokenHash(hash);
    if (result.isFailure) return Output.fail('Invalid or expired token');

    const user = result.value;
    if (user.emailConfirmationToken!.isExpired()) return Output.fail('Token expired');

    user.confirmEmail();
    await this.userRepo.save(user);
    return Output.ok({ success: true });
  }
}
