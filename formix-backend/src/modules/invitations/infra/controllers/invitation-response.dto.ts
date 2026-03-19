import { ApiProperty } from '@nestjs/swagger';

export class InvitationItemDto {
  @ApiProperty({ example: 'uuid', description: 'Invitation ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email of the invited user' })
  email: string;

  @ApiProperty({ example: 'member', description: 'Role assigned to the invited user' })
  role: string;

  @ApiProperty({ example: 'pending', description: 'Status of the invitation' })
  status: string;

  @ApiProperty({ description: 'Expiry date of the invitation' })
  expiresAt: Date;

  @ApiProperty({ description: 'Creation date of the invitation' })
  createdAt: Date;
}

export class ListInvitationsResponseDto {
  @ApiProperty({ type: [InvitationItemDto] })
  invitations: InvitationItemDto[];
}

export class CreateInvitationResponseDto {
  @ApiProperty({ example: 'uuid', description: 'ID of the created invitation' })
  invitationId: string;
}
