import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';

export interface UpdateProfileInput {
  userId: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<Output<{ updated: true }>> {
    const result = await this.userRepo.findById(UserId.from(input.userId));
    if (result.isFailure) return Output.fail(result.errorMessage);

    const user = result.value;

    if (input.name) {
      try {
        user.updateName(input.name);
      } catch (e: unknown) {
        return Output.fail((e as Error).message);
      }
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        return Output.fail('Current password is required to change password');
      }

      const isCorrect = await user.passwordHash.compare(input.currentPassword);
      if (!isCorrect) return Output.fail('Current password is incorrect');

      try {
        const newPassword = await Password.create(input.newPassword);
        user.updatePassword(newPassword);
      } catch (e: unknown) {
        return Output.fail((e as Error).message);
      }
    }

    await this.userRepo.save(user);
    return Output.ok({ updated: true });
  }
}
