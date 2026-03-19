import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IResponseRepository,
  FindByFormIdOptions,
} from '@modules/responses/domain/repositories/response.repository';
import { ResponseAggregate } from '@modules/responses/domain/aggregate/response.aggregate';
import { ResponseId } from '@modules/responses/domain/aggregate/value-objects/response-id.vo';
import { ResponseDocument, ResponseSchemaClass } from '../schemas/response.schema';

@Injectable()
export class MongoResponseRepository implements IResponseRepository {
  constructor(
    @InjectModel(ResponseSchemaClass.name)
    private readonly responseModel: Model<ResponseDocument>,
  ) {}

  async save(response: ResponseAggregate): Promise<void> {
    await this.responseModel.findOneAndUpdate(
      { _id: response.id.getValue() },
      {
        $set: {
          formId: response.formId,
          organizationId: response.organizationId,
          answers: response.answers,
          submittedAt: response.submittedAt,
        },
        $setOnInsert: { _id: response.id.getValue() },
      },
      { upsert: true },
    );
  }

  async findByFormId(formId: string, options?: FindByFormIdOptions): Promise<ResponseAggregate[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const docs = await this.responseModel
      .find({ formId })
      .sort({ submittedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return docs.map(this.toEntity);
  }

  async countByFormId(formId: string): Promise<number> {
    return this.responseModel.countDocuments({ formId }).exec();
  }

  async deleteByFormId(formId: string): Promise<void> {
    await this.responseModel.deleteMany({ formId }).exec();
  }

  private toEntity(doc: ResponseDocument): ResponseAggregate {
    return ResponseAggregate.reconstitute({
      id: ResponseId.from(doc._id as string),
      formId: doc.formId,
      organizationId: doc.organizationId,
      answers: doc.answers,
      submittedAt: doc.submittedAt,
    });
  }
}
