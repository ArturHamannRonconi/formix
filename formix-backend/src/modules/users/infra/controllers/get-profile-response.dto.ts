import { ApiProperty } from '@nestjs/swagger';

export class GetProfileResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'João Silva', description: 'User display name' })
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'User email (immutable)' })
  email: string;

  @ApiProperty({ example: true, description: 'Whether the email has been confirmed' })
  emailConfirmed: boolean;
}
