import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { QuestionId } from '../aggregate/value-objects/question-id.vo';
import { Output } from '@shared/output';

export interface ReorderQuestionsInput {
  organizationId: string;
  formId: string;
  questions: { id: string; order: number }[];
}

export interface ReorderQuestionsOutput {
  reordered: boolean;
}

@Injectable()
export class ReorderQuestionsUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: ReorderQuestionsInput): Promise<Output<ReorderQuestionsOutput>> {
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

    for (const item of input.questions) {
      let questionId: QuestionId;
      try {
        questionId = QuestionId.from(item.id);
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

      question.update({ order: item.order });
      await this.questionRepository.save(question);
    }

    return Output.ok({ reordered: true });
  }
}
