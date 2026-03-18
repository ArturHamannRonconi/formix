import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Output } from '@shared/output';

export interface GetProfileInput {
  userId: string;
}

export interface GetProfileOutput {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetProfileInput): Promise<Output<GetProfileOutput>> {
    const result = await this.userRepo.findById(UserId.from(input.userId));
    if (result.isFailure) return Output.fail(result.errorMessage);

    const user = result.value;
    return Output.ok({
      id: user.id.getValue(),
      name: user.name,
      email: user.email.getValue(),
      emailConfirmed: user.emailConfirmed,
    });
  }
}
