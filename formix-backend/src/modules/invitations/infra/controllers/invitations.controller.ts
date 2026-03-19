import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@modules/auth/infra/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { CreateInvitationUseCase } from '@modules/invitations/domain/usecases/create-invitation.usecase';
import { AcceptInvitationUseCase } from '@modules/invitations/domain/usecases/accept-invitation.usecase';
import { ListInvitationsUseCase } from '@modules/invitations/domain/usecases/list-invitations.usecase';
import { ResendInvitationUseCase } from '@modules/invitations/domain/usecases/resend-invitation.usecase';
import { CancelInvitationUseCase } from '@modules/invitations/domain/usecases/cancel-invitation.usecase';
import { CreateInvitationDto } from './create-invitation.dto';
import { AcceptInvitationDto } from './accept-invitation.dto';
import {
  CreateInvitationResponseDto,
  ListInvitationsResponseDto,
} from './invitation-response.dto';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly listInvitationsUseCase: ListInvitationsUseCase,
    private readonly resendInvitationUseCase: ResendInvitationUseCase,
    private readonly cancelInvitationUseCase: CancelInvitationUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an invitation to join the organization (admin only)' })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({ status: 201, description: 'Invitation created successfully', type: CreateInvitationResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requester is not admin' })
  @ApiResponse({ status: 409, description: 'Invitation already pending or user already a member' })
  async createInvitation(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreateInvitationResponseDto> {
    const output = await this.createInvitationUseCase.execute({
      organizationId: user.organizationId,
      requestingUserId: user.userId,
      requestingRole: user.role,
      email: dto.email,
      role: dto.role,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Only admins can send invitations') {
        throw new ForbiddenException(output.errorMessage);
      }
      if (
        output.errorMessage === 'Invitation already pending for this email' ||
        output.errorMessage === 'User is already a member of this organization'
      ) {
        throw new ConflictException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Post('accept')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Accept an invitation to join the organization' })
  @ApiBody({ type: AcceptInvitationDto })
  @ApiResponse({ status: 200, description: 'Invitation accepted, tokens returned' })
  @ApiResponse({ status: 400, description: 'Invalid, expired or already accepted token' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
    organizationId: string;
  }> {
    const output = await this.acceptInvitationUseCase.execute(dto);

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all invitations for the current organization (admin only)' })
  @ApiResponse({ status: 200, description: 'List of invitations', type: ListInvitationsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requester is not admin' })
  async listInvitations(@CurrentUser() user: JwtPayload): Promise<ListInvitationsResponseDto> {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can list invitations');
    }

    const output = await this.listInvitationsUseCase.execute({
      organizationId: user.organizationId,
    });

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Post(':id/resend')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend an invitation with a new token (admin only)' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requester is not admin' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async resendInvitation(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ resent: true }> {
    const output = await this.resendInvitationUseCase.execute({
      organizationId: user.organizationId,
      invitationId: id,
      requestingRole: user.role,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Only admins can resend invitations') {
        throw new ForbiddenException(output.errorMessage);
      }
      if (output.errorMessage === 'Invitation not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a pending invitation (admin only)' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request — invitation not pending' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — requester is not admin' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async cancelInvitation(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ cancelled: true }> {
    const output = await this.cancelInvitationUseCase.execute({
      organizationId: user.organizationId,
      invitationId: id,
      requestingRole: user.role,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Only admins can cancel invitations') {
        throw new ForbiddenException(output.errorMessage);
      }
      if (output.errorMessage === 'Invitation not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }
}
