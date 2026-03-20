import { Injectable } from '@nestjs/common';
import { BidirectionalMapper } from '@shared/bidirectional-mapper';
import { ResponseAggregate } from '@modules/responses/domain/aggregate/response.aggregate';
import { ResponseId } from '@modules/responses/domain/aggregate/value-objects/response-id.vo';

export interface ResponseSchemaDto {
  _id: string;
  formId: string;
  organizationId: string;
  answers: { questionId: string; value: unknown }[];
  submittedAt: Date;
}

@Injectable()
export class ResponseMapper implements BidirectionalMapper<ResponseAggregate, ResponseSchemaDto> {
  toRight(response: ResponseAggregate): ResponseSchemaDto {
    return {
      _id: response.id.getValue(),
      formId: response.formId,
      organizationId: response.organizationId,
      answers: response.answers,
      submittedAt: response.submittedAt,
    };
  }

  toLeft(dto: ResponseSchemaDto): ResponseAggregate {
    return ResponseAggregate.reconstitute({
      id: ResponseId.from(dto._id),
      formId: dto.formId,
      organizationId: dto.organizationId,
      answers: dto.answers,
      submittedAt: dto.submittedAt,
    });
  }
}
