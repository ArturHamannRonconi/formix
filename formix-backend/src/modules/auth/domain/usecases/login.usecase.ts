import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { RefreshTokenEntity } from '@modules/users/domain/aggregate/entities/refresh-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Output } from '@shared/output';

export const LOGIN_JWT_SIGN_FUNCTION = 'LOGIN_JWT_SIGN_FUNCTION';
export const REFRESH_TOKEN_EXPIRES_IN_MS = 'REFRESH_TOKEN_EXPIRES_IN_MS';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  userId: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    @Inject(LOGIN_JWT_SIGN_FUNCTION) private readonly jwtSign: (payload: Record<string, unknown>) => string,
    @Inject(REFRESH_TOKEN_EXPIRES_IN_MS) private readonly refreshTokenExpiresInMs: number,
  ) {}

  async execute(input: LoginInput): Promise<Output<LoginOutput>> {
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch {
      return Output.fail('Invalid credentials');
    }

    const result = await this.userRepo.findByEmail(email);
    if (result.isFailure) return Output.fail('Invalid credentials');

    const user = result.value;
    const passwordMatch = await user.passwordHash.compare(input.password);
    if (!passwordMatch) return Output.fail('Invalid credentials');

    if (!user.emailConfirmed) return Output.fail('Email not confirmed');

    const orgs = await this.orgRepo.findByMemberId(user.id);
    if (!orgs || orgs.length === 0) return Output.fail('No organization found for user');

    const org = orgs[0];
    const membership = org.findMemberByUserId(user.id);
    const role = membership?.role ?? 'member';

    const accessToken = this.jwtSign({
      sub: user.id.getValue(),
      name: user.name,
      email: user.email.getValue(),
      organizationId: org.id.getValue(),
      role,
    });

    const refreshToken = RefreshTokenEntity.create(this.refreshTokenExpiresInMs);
    user.addRefreshToken(refreshToken);
    await this.userRepo.save(user);

    return Output.ok({
      accessToken,
      refreshToken: refreshToken.rawToken!,
      userId: user.id.getValue(),
      organizationId: org.id.getValue(),
      role,
    });
  }
}
