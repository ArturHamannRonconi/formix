import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { QuestionId } from '../aggregate/value-objects/question-id.vo';
import { Output } from '@shared/output';

export interface UpdateQuestionInput {
  organizationId: string;
  formId: string;
  questionId: string;
  label?: string;
  description?: string;
  required?: boolean;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface UpdateQuestionOutput {
  updated: boolean;
}

@Injectable()
export class UpdateQuestionUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: UpdateQuestionInput): Promise<Output<UpdateQuestionOutput>> {
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

    let questionId: QuestionId;
    try {
      questionId = QuestionId.from(input.questionId);
    } catch {
      return Output.fail('Question not found');
    }

    const questionResult = await this.questionRepository.findById(questionId);
    if (questionResult.isFailure) {
      return Output.fail('Question not found');
    }

    const question = questionResult.value;
    if (question.formId !== input.formId) {
      return Output.fail('Question not found');
    }

    question.update({
      label: input.label,
      description: input.description,
      required: input.required,
      options: input.options,
      validation: input.validation,
    });

    try {
      question.validateForType();
    } catch (err: unknown) {
      return Output.fail(err instanceof Error ? err.message : 'Validation failed');
    }

    await this.questionRepository.save(question);

    return Output.ok({ updated: true });
  }
}
