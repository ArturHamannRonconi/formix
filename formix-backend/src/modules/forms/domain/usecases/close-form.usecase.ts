import { Inject, Injectable } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';

export interface CloseFormInput {
  organizationId: string;
  formId: string;
}

export interface CloseFormOutput {
  closed: boolean;
}

@Injectable()
export class CloseFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
  ) {}

  async execute(input: CloseFormInput): Promise<Output<CloseFormOutput>> {
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

    form.close();
    await this.formRepository.save(form);

    return Output.ok({ closed: true });
  }
}
