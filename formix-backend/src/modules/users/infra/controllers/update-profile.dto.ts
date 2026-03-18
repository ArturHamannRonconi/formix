import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'João Silva', description: 'New display name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'CurrentPass1', description: 'Current password (required when changing password)' })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({ example: 'NewPass1234', description: 'New password (min 8 chars, 1 letter, 1 number)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
