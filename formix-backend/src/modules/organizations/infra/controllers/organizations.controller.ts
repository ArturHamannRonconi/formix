import {
  Controller,
  ForbiddenException,
  Get,
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
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { ListMembersResponseDto } from './list-members-response.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly listMembersUseCase: ListMembersUseCase,
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
}
