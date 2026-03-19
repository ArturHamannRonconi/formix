import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { QuestionEntity } from '../aggregate/question.entity';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';

export interface AddQuestionInput {
  organizationId: string;
  formId: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface AddQuestionOutput {
  questionId: string;
}

@Injectable()
export class AddQuestionUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: AddQuestionInput): Promise<Output<AddQuestionOutput>> {
    let formId: FormId;
    try {
      formId = FormId.from(input.formId);
    } catch {
      return Output.fail('Form not found');
    }

    const formResult = await this.formRepository.findById(formId);
    if (formResult.isFailure) {
      return Output.fail('Form not found');
    }

    const form = formResult.value;
    if (form.organizationId !== input.organizationId) {
      return Output.fail('Form not found');
    }

    const currentCount = await this.questionRepository.countByFormId(input.formId);

    let question: QuestionEntity;
    try {
      question = QuestionEntity.create({
        formId: input.formId,
        organizationId: input.organizationId,
        type: input.type,
        label: input.label,
        description: input.description,
        required: input.required,
        order: currentCount,
        options: input.options,
        validation: input.validation,
      });
    } catch (err: unknown) {
      return Output.fail(err instanceof Error ? err.message : 'Failed to create question');
    }

    await this.questionRepository.save(question);

    return Output.ok({ questionId: question.id.getValue() });
  }
}
