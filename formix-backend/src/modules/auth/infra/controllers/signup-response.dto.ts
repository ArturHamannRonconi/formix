import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDto {
  @ApiProperty({ example: 'uuid-v4', description: 'ID of the created user' })
  userId: string;

  @ApiProperty({ example: 'uuid-v4', description: 'ID of the created organization' })
  organizationId: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ example: true, description: 'Whether email confirmation is required' })
  emailConfirmationRequired: boolean;
}
