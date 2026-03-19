import { Inject, Injectable } from '@nestjs/common';
import { FormAggregate } from '../aggregate/form.aggregate';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { Output } from '@shared/output';

export interface CreateFormInput {
  organizationId: string;
  createdBy: string;
  title: string;
  description?: string;
}

export interface CreateFormOutput {
  formId: string;
}

@Injectable()
export class CreateFormUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
  ) {}

  async execute(input: CreateFormInput): Promise<Output<CreateFormOutput>> {
    let form: FormAggregate;
    try {
      form = FormAggregate.create({
        organizationId: input.organizationId,
        createdBy: input.createdBy,
        title: input.title,
        description: input.description,
      });
    } catch (err: unknown) {
      return Output.fail(err instanceof Error ? err.message : 'Failed to create form');
    }

    await this.formRepository.save(form);

    return Output.ok({ formId: form.id.getValue() });
  }
}
