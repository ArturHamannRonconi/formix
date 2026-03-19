import { Inject, Injectable, Optional } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '../repositories/question.repository';
import { IResponseRepository, RESPONSE_REPOSITORY } from '@modules/responses/domain/repositories/response.repository';
import { IResponseEmailRepository, RESPONSE_EMAIL_REPOSITORY } from '@modules/responses/domain/repositories/response-email.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';

export interface DeleteFormInput {
  organizationId: string;
  formId: string;
}

export interface DeleteFormOutput {
  deleted: boolean;
}

@Injectable()
export class DeleteFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
    @Optional() @Inject(RESPONSE_REPOSITORY) private readonly responseRepository?: IResponseRepository,
    @Optional() @Inject(RESPONSE_EMAIL_REPOSITORY) private readonly responseEmailRepository?: IResponseEmailRepository,
  ) {}

  async execute(input: DeleteFormInput): Promise<Output<DeleteFormOutput>> {
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

    await this.questionRepository.deleteByFormId(input.formId);
    if (this.responseRepository) await this.responseRepository.deleteByFormId(input.formId);
    if (this.responseEmailRepository) await this.responseEmailRepository.deleteByFormId(input.formId);
    await this.formRepository.delete(formId);

    return Output.ok({ deleted: true });
  }
}
