import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository';
import { IOrganizationRepository, ORGANIZATION_REPOSITORY } from '@modules/organizations/domain/repositories/organization.repository';
import { RefreshTokenEntity } from '@modules/users/domain/aggregate/entities/refresh-token.entity';
import { Output } from '@shared/output';

export const REFRESH_JWT_SIGN_FUNCTION = 'REFRESH_JWT_SIGN_FUNCTION';
export const REFRESH_JWT_REFRESH_SIGN_FUNCTION = 'REFRESH_JWT_REFRESH_SIGN_FUNCTION';
export const REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS = 'REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  userId: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ORGANIZATION_REPOSITORY) private readonly orgRepo: IOrganizationRepository,
    @Inject(REFRESH_JWT_SIGN_FUNCTION) private readonly jwtSign: (payload: Record<string, unknown>) => string,
    @Inject(REFRESH_JWT_REFRESH_SIGN_FUNCTION) private readonly jwtRefreshSign: (payload: Record<string, unknown>) => string,
    @Inject(REFRESH_TOKEN_REFRESH_EXPIRES_IN_MS) private readonly refreshTokenExpiresInMs: number,
  ) {}

  async execute(input: RefreshTokenInput): Promise<Output<RefreshTokenOutput>> {
    const hash = createHash('sha256').update(input.refreshToken).digest('hex');

    const result = await this.userRepo.findByRefreshTokenHash(hash);
    if (result.isFailure) return Output.fail('Invalid or expired refresh token');

    const user = result.value;
    const existingToken = user.findRefreshTokenByHash(hash);
    if (!existingToken) return Output.fail('Invalid or expired refresh token');

    if (existingToken.isExpired()) {
      user.invalidateRefreshTokenFamily(existingToken.family);
      await this.userRepo.save(user);
      return Output.fail('Refresh token expired');
    }

    // Token reuse detection - if token was already used, invalidate whole family (replay attack)
    if (existingToken.wasUsed()) {
      user.invalidateRefreshTokenFamily(existingToken.family);
      await this.userRepo.save(user);
      return Output.fail('Refresh token already used');
    }

    const orgs = await this.orgRepo.findByMemberId(user.id);
    if (!orgs || orgs.length === 0) return Output.fail('No organization found for user');

    const org = orgs[0];
    const membership = org.findMemberByUserId(user.id);
    const role = membership?.role ?? 'member';

    // Mark old token as used and issue new token in same family
    existingToken.markAsUsed();
    const newRefreshToken = RefreshTokenEntity.createWithFamily(existingToken.family, this.refreshTokenExpiresInMs);
    user.addRefreshToken(newRefreshToken);
    await this.userRepo.save(user);

    const accessToken = this.jwtSign({
      sub: user.id.getValue(),
      organizationId: org.id.getValue(),
      role,
    });

    return Output.ok({
      accessToken,
      refreshToken: newRefreshToken.rawToken!,
      userId: user.id.getValue(),
      organizationId: org.id.getValue(),
      role,
    });
  }
}
