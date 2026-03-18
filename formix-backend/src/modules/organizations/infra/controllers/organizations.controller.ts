import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListMembersUseCase } from '@modules/organizations/domain/usecases/list-members.usecase';
import { RemoveMemberUseCase } from '@modules/organizations/domain/usecases/remove-member.usecase';
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { ListMembersResponseDto } from './list-members-response.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
  ) {}

  @Get(':orgId/members')
  @ApiOperation({ summary: 'List all members of an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'List of members returned', type: ListMembersResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — orgId does not match token organization' })
  async listMembers(
    @Param('orgId') orgId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ListMembersResponseDto> {
    if (orgId !== user.organizationId) {
      throw new ForbiddenException('Access denied to this organization');
    }

    const output = await this.listMembersUseCase.execute({ organizationId: orgId });
    if (output.isFailure) throw new ForbiddenException(output.errorMessage);
    return output.value;
  }

  @Delete(':orgId/members/:userId')
  @ApiOperation({ summary: 'Remove a member from an organization (admin only)' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request — cannot remove last admin' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — not admin or wrong org' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ removed: true }> {
    if (orgId !== user.organizationId) {
      throw new ForbiddenException('Access denied to this organization');
    }

    const output = await this.removeMemberUseCase.execute({
      organizationId: orgId,
      requestingUserId: user.userId,
      targetUserId: userId,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Only admins can remove members') {
        throw new ForbiddenException(output.errorMessage);
      }
      if (output.errorMessage === 'Member not found in this organization') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }
}
