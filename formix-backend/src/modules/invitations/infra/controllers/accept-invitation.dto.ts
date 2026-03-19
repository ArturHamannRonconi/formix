import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'uuid-token', description: 'Invitation token from the invite link' })
  @IsString()
  token: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Name (required if user does not have an account)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'SecurePass1', description: 'Password (required if user does not have an account)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
