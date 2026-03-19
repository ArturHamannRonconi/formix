import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { GetFormAnalyticsUseCase } from '@modules/analytics/domain/usecases/get-form-analytics.usecase';
import { AnalyticsResponseDto } from './analytics-response.dto';

@ApiTags('analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly getFormAnalyticsUseCase: GetFormAnalyticsUseCase) {}

  @Get('forms/:id/analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated analytics for a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'], description: 'Time grouping for responses over time (default: day)' })
  @ApiResponse({ status: 200, description: 'Aggregated analytics metrics', type: AnalyticsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — form belongs to another organization' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async getFormAnalytics(
    @Param('id') formId: string,
    @CurrentUser() user: JwtPayload,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ): Promise<AnalyticsResponseDto> {
    const output = await this.getFormAnalyticsUseCase.execute({
      organizationId: user.organizationId,
      formId,
      groupBy,
    });

    if (output.isFailure) {
      const msg = output.errorMessage;
      if (msg.includes('Forbidden')) throw new ForbiddenException(msg);
      throw new NotFoundException(msg);
    }

    return output.value as AnalyticsResponseDto;
  }
}
