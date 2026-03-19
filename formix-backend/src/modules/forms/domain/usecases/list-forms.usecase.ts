import { Inject, Injectable } from '@nestjs/common';
import { FormAggregate } from '../aggregate/form.aggregate';
import { IFormRepository, FORM_REPOSITORY } from '../repositories/form.repository';
import { Output } from '@shared/output';

export interface ListFormsInput {
  organizationId: string;
  status?: string;
}

export interface FormSummary {
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
}

export interface ListFormsOutput {
  forms: FormSummary[];
}

@Injectable()
export class ListFormsUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
  ) {}

  async execute(input: ListFormsInput): Promise<Output<ListFormsOutput>> {
    const forms = await this.formRepository.findByOrganizationId(input.organizationId, input.status);

    const formSummaries: FormSummary[] = forms.map((form: FormAggregate) => ({
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
    }));

    return Output.ok({ forms: formSummaries });
  }
}
