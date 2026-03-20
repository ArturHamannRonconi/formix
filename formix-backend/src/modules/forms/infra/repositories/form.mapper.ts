import { Injectable } from '@nestjs/common';
import { BidirectionalMapper } from '@shared/bidirectional-mapper';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { FormStatus } from '@modules/forms/domain/aggregate/value-objects/form-status.vo';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';

export interface FormSchemaDto {
  _id: string;
  organizationId: string;
  createdBy: string;
  title: string;
  description?: string;
  publicToken?: string;
  settings: {
    expiresAt?: Date;
    maxResponses?: number;
    allowMultipleResponses: boolean;
    allowedEmailDomains: string[];
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FormMapper implements BidirectionalMapper<FormAggregate, FormSchemaDto> {
  toRight(form: FormAggregate): FormSchemaDto {
    return {
      _id: form.id.getValue(),
      organizationId: form.organizationId,
      createdBy: form.createdBy,
      title: form.title,
      description: form.description,
      publicToken: form.publicToken?.getValue(),
      settings: form.settings,
      status: form.status.getValue(),
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }

  toLeft(dto: FormSchemaDto): FormAggregate {
    return FormAggregate.reconstitute({
      id: FormId.from(dto._id),
      organizationId: dto.organizationId,
      createdBy: dto.createdBy,
      title: dto.title,
      description: dto.description,
      publicToken: dto.publicToken ? PublicToken.from(dto.publicToken) : undefined,
      settings: dto.settings,
      status: FormStatus.from(dto.status),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
