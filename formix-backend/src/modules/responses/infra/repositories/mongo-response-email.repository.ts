import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IResponseEmailRepository } from '@modules/responses/domain/repositories/response-email.repository';
import { ResponseEmailAggregate } from '@modules/responses/domain/aggregate/response-email.aggregate';
import { ResponseEmailId } from '@modules/responses/domain/aggregate/value-objects/response-email-id.vo';
import {
  ResponseEmailDocument,
  ResponseEmailSchemaClass,
} from '../schemas/response-email.schema';

@Injectable()
export class MongoResponseEmailRepository implements IResponseEmailRepository {
  constructor(
    @InjectModel(ResponseEmailSchemaClass.name)
    private readonly responseEmailModel: Model<ResponseEmailDocument>,
  ) {}

  async save(responseEmail: ResponseEmailAggregate): Promise<void> {
    await this.responseEmailModel.findOneAndUpdate(
      { _id: responseEmail.id.getValue() },
      {
        $set: {
          formId: responseEmail.formId,
          emailHash: responseEmail.emailHash,
          respondedAt: responseEmail.respondedAt,
        },
        $setOnInsert: { _id: responseEmail.id.getValue() },
      },
      { upsert: true },
    );
  }

  async existsByFormIdAndEmailHash(formId: string, emailHash: string): Promise<boolean> {
    const count = await this.responseEmailModel.countDocuments({ formId, emailHash }).exec();
    return count > 0;
  }

  async deleteByFormId(formId: string): Promise<void> {
    await this.responseEmailModel.deleteMany({ formId }).exec();
  }

  private toEntity(doc: ResponseEmailDocument): ResponseEmailAggregate {
    return ResponseEmailAggregate.reconstitute({
      id: ResponseEmailId.from(doc._id as string),
      formId: doc.formId,
      emailHash: doc.emailHash,
      respondedAt: doc.respondedAt,
    });
  }
}
