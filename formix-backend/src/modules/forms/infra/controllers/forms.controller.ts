import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
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
import { CurrentUser, JwtPayload } from '@modules/auth/infra/decorators/current-user.decorator';
import { CreateFormUseCase } from '@modules/forms/domain/usecases/create-form.usecase';
import { ListFormsUseCase } from '@modules/forms/domain/usecases/list-forms.usecase';
import { GetFormUseCase } from '@modules/forms/domain/usecases/get-form.usecase';
import { UpdateFormUseCase } from '@modules/forms/domain/usecases/update-form.usecase';
import { DeleteFormUseCase } from '@modules/forms/domain/usecases/delete-form.usecase';
import { CreateFormDto } from './create-form.dto';
import { UpdateFormDto } from './update-form.dto';
import {
  CreateFormResponseDto,
  GetFormResponseDto,
  ListFormsResponseDto,
} from './form-response.dto';

@ApiTags('forms')
@Controller('forms')
@ApiBearerAuth()
export class FormsController {
  constructor(
    private readonly createFormUseCase: CreateFormUseCase,
    private readonly listFormsUseCase: ListFormsUseCase,
    private readonly getFormUseCase: GetFormUseCase,
    private readonly updateFormUseCase: UpdateFormUseCase,
    private readonly deleteFormUseCase: DeleteFormUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  @ApiBody({ type: CreateFormDto })
  @ApiResponse({ status: 201, description: 'Form created successfully', type: CreateFormResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createForm(
    @Body() dto: CreateFormDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreateFormResponseDto> {
    const output = await this.createFormUseCase.execute({
      organizationId: user.organizationId,
      createdBy: user.userId,
      title: dto.title,
      description: dto.description,
    });

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Get()
  @ApiOperation({ summary: 'List all forms for the current organization' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by form status (draft, active, closed, expired)' })
  @ApiResponse({ status: 200, description: 'List of forms', type: ListFormsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listForms(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ): Promise<ListFormsResponseDto> {
    const output = await this.listFormsUseCase.execute({
      organizationId: user.organizationId,
      status,
    });

    if (output.isFailure) {
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a form by ID with its questions' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form with questions', type: GetFormResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async getForm(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<GetFormResponseDto> {
    const output = await this.getFormUseCase.execute({
      organizationId: user.organizationId,
      formId: id,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiBody({ type: UpdateFormDto })
  @ApiResponse({ status: 200, description: 'Form updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async updateForm(
    @Param('id') id: string,
    @Body() dto: UpdateFormDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ updated: boolean }> {
    const settings = dto.settings
      ? {
          ...dto.settings,
          expiresAt: dto.settings.expiresAt ? new Date(dto.settings.expiresAt) : undefined,
        }
      : undefined;

    const output = await this.updateFormUseCase.execute({
      organizationId: user.organizationId,
      formId: id,
      title: dto.title,
      description: dto.description,
      settings,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a form and its questions' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async deleteForm(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ deleted: boolean }> {
    const output = await this.deleteFormUseCase.execute({
      organizationId: user.organizationId,
      formId: id,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }
}
