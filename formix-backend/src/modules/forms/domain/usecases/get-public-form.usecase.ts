import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { Output } from '@shared/output';

export interface GetPublicFormOutput {
  id: string;
  title: string;
  description?: string;
  status: string;
  questions: {
    id: string;
    type: string;
    label: string;
    description?: string;
    required: boolean;
    order: number;
    options?: string[];
    validation?: { min?: number; max?: number; pattern?: string };
  }[];
}

@Injectable()
export class GetPublicFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(publicToken: string): Promise<Output<GetPublicFormOutput>> {
    const formResult = await this.formRepository.findByPublicToken(publicToken);
    if (formResult.isFailure) return Output.fail('Form not found');

    const form = formResult.value;
    const questions = await this.questionRepository.findByFormIdOrdered(form.id.getValue());

    return Output.ok({
      id: form.id.getValue(),
      title: form.title,
      description: form.description,
      status: form.status.getValue(),
      questions: questions.map(q => ({
        id: q.id.getValue(),
        type: q.type.getValue(),
        label: q.label,
        description: q.description,
        required: q.required,
        order: q.order,
        options: q.options,
        validation: q.validation,
      })),
    });
  }
}
