import { ApiProperty } from '@nestjs/swagger';

export class MemberResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'João Silva', description: 'Member display name' })
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'Member email' })
  email: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'member'], description: 'Member role in the organization' })
  role: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z', description: 'Date the member joined the organization' })
  joinedAt: Date;
}

export class ListMembersResponseDto {
  @ApiProperty({ type: [MemberResponseDto] })
  members: MemberResponseDto[];
}
