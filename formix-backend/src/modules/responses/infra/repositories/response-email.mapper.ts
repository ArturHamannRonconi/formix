import { Injectable } from '@nestjs/common';
import { BidirectionalMapper } from '@shared/bidirectional-mapper';
import { ResponseEmailAggregate } from '@modules/responses/domain/aggregate/response-email.aggregate';
import { ResponseEmailId } from '@modules/responses/domain/aggregate/value-objects/response-email-id.vo';

export interface ResponseEmailSchemaDto {
  _id: string;
  formId: string;
  emailHash: string;
  respondedAt: Date;
}

@Injectable()
export class ResponseEmailMapper
  implements BidirectionalMapper<ResponseEmailAggregate, ResponseEmailSchemaDto>
{
  toRight(responseEmail: ResponseEmailAggregate): ResponseEmailSchemaDto {
    return {
      _id: responseEmail.id.getValue(),
      formId: responseEmail.formId,
      emailHash: responseEmail.emailHash,
      respondedAt: responseEmail.respondedAt,
    };
  }

  toLeft(dto: ResponseEmailSchemaDto): ResponseEmailAggregate {
    return ResponseEmailAggregate.reconstitute({
      id: ResponseEmailId.from(dto._id),
      formId: dto.formId,
      emailHash: dto.emailHash,
      respondedAt: dto.respondedAt,
    });
  }
}
