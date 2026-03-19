import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of the user to invite' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'member', description: 'Role to assign to the invited user', enum: ['member'] })
  @IsOptional()
  @IsString()
  @IsIn(['member'])
  role?: 'member';
}
