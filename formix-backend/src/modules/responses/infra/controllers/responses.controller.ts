import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@modules/auth/infra/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { SubmitResponseUseCase } from '@modules/responses/domain/usecases/submit-response.usecase';
import { ListResponsesUseCase } from '@modules/responses/domain/usecases/list-responses.usecase';
import { GetPublicFormUseCase } from '@modules/forms/domain/usecases/get-public-form.usecase';
import { SubmitResponseDto, SubmitResponseResponseDto } from './submit-response.dto';

@ApiTags('responses')
@Controller()
export class ResponsesController {
  constructor(
    private readonly submitResponseUseCase: SubmitResponseUseCase,
    private readonly listResponsesUseCase: ListResponsesUseCase,
    private readonly getPublicFormUseCase: GetPublicFormUseCase,
  ) {}

  @Get('forms/public/:publicToken')
  @Public()
  @ApiOperation({ summary: 'Get public form data by public token' })
  @ApiParam({ name: 'publicToken', description: 'Public token of the form' })
  @ApiResponse({ status: 200, description: 'Public form data with questions' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async getPublicForm(@Param('publicToken') publicToken: string) {
    const output = await this.getPublicFormUseCase.execute(publicToken);
    if (output.isFailure) throw new NotFoundException(output.errorMessage);
    return output.value;
  }

  @Post('responses/:publicToken')
  @Public()
  @ApiOperation({ summary: 'Submit a response to a public form' })
  @ApiParam({ name: 'publicToken', description: 'Public token of the form' })
  @ApiBody({ type: SubmitResponseDto })
  @ApiResponse({ status: 201, description: 'Response submitted successfully', type: SubmitResponseResponseDto })
  @ApiResponse({ status: 400, description: 'Form not active, expired, or invalid answers' })
  @ApiResponse({ status: 403, description: 'Email domain not allowed' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  @ApiResponse({ status: 409, description: 'Already responded to this form' })
  async submitResponse(
    @Param('publicToken') publicToken: string,
    @Body() dto: SubmitResponseDto,
  ): Promise<SubmitResponseResponseDto> {
    const output = await this.submitResponseUseCase.execute({
      publicToken,
      email: dto.email,
      answers: dto.answers,
    });

    if (output.isFailure) {
      const msg = output.errorMessage;
      if (msg.includes('not found')) throw new NotFoundException(msg);
      if (msg.includes('domain')) throw new ForbiddenException(msg);
      if (msg.includes('already responded')) throw new ConflictException(msg);
      throw new BadRequestException(msg);
    }

    return output.value;
  }

  @Get('forms/:id/responses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List paginated responses for a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiQuery({ name: 'offset', required: false, description: 'Pagination offset (default: 0)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results (default: 20)' })
  @ApiResponse({ status: 200, description: 'Paginated list of responses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — form belongs to another organization' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async listResponses(
    @Param('id') formId: string,
    @CurrentUser() user: JwtPayload,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const output = await this.listResponsesUseCase.execute({
      organizationId: user.organizationId,
      formId,
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    if (output.isFailure) {
      const msg = output.errorMessage;
      if (msg.includes('Forbidden')) throw new ForbiddenException(msg);
      throw new NotFoundException(msg);
    }

    return output.value;
  }
}
