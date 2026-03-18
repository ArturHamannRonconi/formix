import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Output } from '@shared/output';

export interface LogoutInput {
  userId: string;
  refreshToken?: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: LogoutInput): Promise<Output<{ success: true }>> {
    let userId: UserId;
    try {
      userId = UserId.from(input.userId);
    } catch {
      return Output.fail('Invalid user');
    }

    const result = await this.userRepo.findById(userId);
    if (result.isFailure) return Output.fail('User not found');

    const user = result.value;

    if (input.refreshToken) {
      const hash = createHash('sha256').update(input.refreshToken).digest('hex');
      const token = user.findRefreshTokenByHash(hash);
      if (token) {
        user.invalidateRefreshTokenFamily(token.family);
      }
    } else {
      user.invalidateAllRefreshTokens();
    }

    await this.userRepo.save(user);
    return Output.ok({ success: true });
  }
}
