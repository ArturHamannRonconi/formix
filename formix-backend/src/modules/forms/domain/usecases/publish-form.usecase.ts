import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { PublicToken } from '../aggregate/value-objects/public-token.vo';
import { Output } from '@shared/output';

export interface PublishFormInput {
  organizationId: string;
  formId: string;
}

export interface PublishFormOutput {
  publicToken: string;
  publicUrl: string;
}

@Injectable()
export class PublishFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: PublishFormInput): Promise<Output<PublishFormOutput>> {
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

    const questionCount = await this.questionRepository.countByFormId(input.formId);
    if (questionCount === 0) {
      return Output.fail('Form must have at least one question');
    }

    if (!form.status.isDraft()) {
      return Output.fail('Form is not in draft status');
    }

    const publicToken = PublicToken.generate();
    form.publish(publicToken);
    await this.formRepository.save(form);

    const tokenValue = publicToken.getValue();
    return Output.ok({
      publicToken: tokenValue,
      publicUrl: `https://app.formix.com/f/${tokenValue}`,
    });
  }
}
