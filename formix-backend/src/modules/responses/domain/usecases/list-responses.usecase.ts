import { Inject, Injectable } from '@nestjs/common';
import { Output } from '@shared/output';
import { IFormRepository, FORM_REPOSITORY } from '@modules/forms/domain/repositories/form.repository';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { IResponseRepository, RESPONSE_REPOSITORY } from '../repositories/response.repository';
import { Answer } from '../aggregate/response.aggregate';

export interface ListResponsesInput {
  organizationId: string;
  formId: string;
  offset?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ResponseDto {
  id: string;
  answers: Answer[];
  submittedAt: Date;
}

export interface ListResponsesOutput {
  responses: ResponseDto[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable()
export class ListResponsesUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(RESPONSE_REPOSITORY) private readonly responseRepository: IResponseRepository,
  ) {}

  async execute(input: ListResponsesInput): Promise<Output<ListResponsesOutput>> {
    let formId: FormId;
    try {
      formId = FormId.from(input.formId);
    } catch {
      return Output.fail('Form not found');
    }

    const formResult = await this.formRepository.findById(formId);
    if (formResult.isFailure) return Output.fail('Form not found');

    const form = formResult.value;
    if (form.organizationId !== input.organizationId) {
      return Output.fail('Forbidden');
    }

    const offset = input.offset ?? 0;
    const limit = input.limit ?? 20;

    const [responses, total] = await Promise.all([
      this.responseRepository.findByFormId(input.formId, {
        offset,
        limit,
        search: input.search,
        sortBy: input.sortBy,
        sortDir: input.sortDir,
      }),
      this.responseRepository.countByFormId(input.formId, input.search),
    ]);

    return Output.ok({
      responses: responses.map(r => ({
        id: r.id.getValue(),
        answers: r.answers,
        submittedAt: r.submittedAt,
      })),
      total,
      offset,
      limit,
    });
  }
}
