import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';

export interface GetFormInput {
  organizationId: string;
  formId: string;
}

export interface QuestionData {
  id: string;
  formId: string;
  organizationId: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: object;
  createdAt: Date;
}

export interface GetFormOutput {
  form: {
    id: string;
    organizationId: string;
    createdBy: string;
    title: string;
    description?: string;
    status: string;
    publicToken?: string;
    settings: object;
    createdAt: Date;
    updatedAt: Date;
  };
  questions: QuestionData[];
}

@Injectable()
export class GetFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: GetFormInput): Promise<Output<GetFormOutput>> {
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

    const questions = await this.questionRepository.findByFormIdOrdered(input.formId);

    return Output.ok({
      form: {
        id: form.id.getValue(),
        organizationId: form.organizationId,
        createdBy: form.createdBy,
        title: form.title,
        description: form.description,
        status: form.status.getValue(),
        publicToken: form.publicToken?.getValue(),
        settings: form.settings,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      },
      questions: questions.map((q) => ({
        id: q.id.getValue(),
        formId: q.formId,
        organizationId: q.organizationId,
        type: q.type.getValue(),
        label: q.label,
        description: q.description,
        required: q.required,
        order: q.order,
        options: q.options,
        validation: q.validation,
        createdAt: q.createdAt,
      })),
    });
  }
}
