import { Inject, Injectable } from '@nestjs/common';
import { FormSettings } from '../aggregate/form.aggregate';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { FormId } from '../aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';

export interface UpdateFormInput {
  organizationId: string;
  formId: string;
  title?: string;
  description?: string;
  settings?: Partial<FormSettings>;
}

export interface UpdateFormOutput {
  updated: boolean;
}

@Injectable()
export class UpdateFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
  ) {}

  async execute(input: UpdateFormInput): Promise<Output<UpdateFormOutput>> {
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

    form.update({
      title: input.title,
      description: input.description,
      settings: input.settings,
    });

    await this.formRepository.save(form);

    return Output.ok({ updated: true });
  }
}
