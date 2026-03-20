import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '@modules/forms/domain/repositories/form.repository';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { IResponseRepository, RESPONSE_REPOSITORY } from '../repositories/response.repository';
import { IResponseEmailRepository, RESPONSE_EMAIL_REPOSITORY } from '../repositories/response-email.repository';
import { Output } from '@shared/output';

export interface ExpireFormInput {
  organizationId: string;
  formId: string;
}

export interface ExpireFormOutput {
  expired: boolean;
}

@Injectable()
export class ExpireFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(RESPONSE_REPOSITORY) private readonly responseRepository: IResponseRepository,
    @Inject(RESPONSE_EMAIL_REPOSITORY) private readonly responseEmailRepository: IResponseEmailRepository,
  ) {}

  async execute(input: ExpireFormInput): Promise<Output<ExpireFormOutput>> {
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

    if (!form.status.isActive()) {
      return Output.fail('Form is not active');
    }

    form.unpublish();
    await this.formRepository.save(form);

    await this.responseRepository.deleteByFormId(input.formId);
    await this.responseEmailRepository.deleteByFormId(input.formId);

    return Output.ok({ expired: true });
  }
}
