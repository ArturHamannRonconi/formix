import { Injectable } from '@nestjs/common';
import { BidirectionalMapper } from '@shared/bidirectional-mapper';
import { QuestionEntity } from '@modules/forms/domain/aggregate/question.entity';
import { QuestionId } from '@modules/forms/domain/aggregate/value-objects/question-id.vo';
import { QuestionType } from '@modules/forms/domain/aggregate/value-objects/question-type.vo';

export interface QuestionSchemaDto {
  _id: string;
  formId: string;
  organizationId: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
  createdAt: Date;
}

@Injectable()
export class QuestionMapper implements BidirectionalMapper<QuestionEntity, QuestionSchemaDto> {
  toRight(question: QuestionEntity): QuestionSchemaDto {
    return {
      _id: question.id.getValue(),
      formId: question.formId,
      organizationId: question.organizationId,
      type: question.type.getValue(),
      label: question.label,
      description: question.description,
      required: question.required,
      order: question.order,
      options: question.options,
      validation: question.validation,
      createdAt: question.createdAt,
    };
  }

  toLeft(dto: QuestionSchemaDto): QuestionEntity {
    return QuestionEntity.reconstitute({
      id: QuestionId.from(dto._id),
      formId: dto.formId,
      organizationId: dto.organizationId,
      type: QuestionType.from(dto.type),
      label: dto.label,
      description: dto.description,
      required: dto.required,
      order: dto.order,
      options: dto.options,
      validation: dto.validation,
      createdAt: dto.createdAt,
    });
  }
}
