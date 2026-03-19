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
import { AddQuestionUseCase } from '@modules/forms/domain/usecases/add-question.usecase';
import { UpdateQuestionUseCase } from '@modules/forms/domain/usecases/update-question.usecase';
import { RemoveQuestionUseCase } from '@modules/forms/domain/usecases/remove-question.usecase';
import { ReorderQuestionsUseCase } from '@modules/forms/domain/usecases/reorder-questions.usecase';
import { CreateFormDto } from './create-form.dto';
import { UpdateFormDto } from './update-form.dto';
import { AddQuestionDto } from './add-question.dto';
import { UpdateQuestionDto } from './update-question.dto';
import { ReorderQuestionsDto } from './reorder-questions.dto';
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
    private readonly addQuestionUseCase: AddQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly removeQuestionUseCase: RemoveQuestionUseCase,
    private readonly reorderQuestionsUseCase: ReorderQuestionsUseCase,
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

  @Post(':formId/questions')
  @ApiOperation({ summary: 'Add a question to a form' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiBody({ type: AddQuestionDto })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async addQuestion(
    @Param('formId') formId: string,
    @Body() dto: AddQuestionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ questionId: string }> {
    const output = await this.addQuestionUseCase.execute({
      organizationId: user.organizationId,
      formId,
      type: dto.type,
      label: dto.label,
      description: dto.description,
      required: dto.required,
      options: dto.options,
      validation: dto.validation,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Patch(':formId/questions/reorder')
  @ApiOperation({ summary: 'Reorder questions in a form' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiBody({ type: ReorderQuestionsDto })
  @ApiResponse({ status: 200, description: 'Questions reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form or question not found' })
  async reorderQuestions(
    @Param('formId') formId: string,
    @Body() dto: ReorderQuestionsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ reordered: boolean }> {
    const output = await this.reorderQuestionsUseCase.execute({
      organizationId: user.organizationId,
      formId,
      questions: dto.questions,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found' || output.errorMessage === 'Question not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Patch(':formId/questions/:questionId')
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form or question not found' })
  async updateQuestion(
    @Param('formId') formId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ updated: boolean }> {
    const output = await this.updateQuestionUseCase.execute({
      organizationId: user.organizationId,
      formId,
      questionId,
      label: dto.label,
      description: dto.description,
      required: dto.required,
      options: dto.options,
      validation: dto.validation,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found' || output.errorMessage === 'Question not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }

  @Delete(':formId/questions/:questionId')
  @ApiOperation({ summary: 'Remove a question from a form' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Form or question not found' })
  async removeQuestion(
    @Param('formId') formId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ removed: boolean }> {
    const output = await this.removeQuestionUseCase.execute({
      organizationId: user.organizationId,
      formId,
      questionId,
    });

    if (output.isFailure) {
      if (output.errorMessage === 'Form not found' || output.errorMessage === 'Question not found') {
        throw new NotFoundException(output.errorMessage);
      }
      throw new BadRequestException(output.errorMessage);
    }

    return output.value;
  }
}
