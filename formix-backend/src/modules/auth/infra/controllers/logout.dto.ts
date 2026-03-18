import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({ description: 'Refresh token to invalidate (if not provided, all tokens are invalidated)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
