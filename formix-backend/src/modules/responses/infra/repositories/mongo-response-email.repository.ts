import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IResponseEmailRepository } from '@modules/responses/domain/repositories/response-email.repository';
import { ResponseEmailAggregate } from '@modules/responses/domain/aggregate/response-email.aggregate';
import {
  ResponseEmailDocument,
  ResponseEmailSchemaClass,
} from '../schemas/response-email.schema';
import { ResponseEmailMapper, ResponseEmailSchemaDto } from './response-email.mapper';

@Injectable()
export class MongoResponseEmailRepository implements IResponseEmailRepository {
  constructor(
    @InjectModel(ResponseEmailSchemaClass.name)
    private readonly responseEmailModel: Model<ResponseEmailDocument>,
    private readonly responseEmailMapper: ResponseEmailMapper,
  ) {}

  async save(responseEmail: ResponseEmailAggregate): Promise<void> {
    const dto = this.responseEmailMapper.toRight(responseEmail);

    const alreadyExists = await this.responseEmailModel.exists({ _id: dto._id });

    if (!alreadyExists) {
      await this.responseEmailModel.create(dto);
      return;
    }

    await this.responseEmailModel.replaceOne({ _id: dto._id }, dto);
  }

  async existsByFormIdAndEmailHash(formId: string, emailHash: string): Promise<boolean> {
    const count = await this.responseEmailModel.countDocuments({ formId, emailHash }).exec();
    return count > 0;
  }

  async deleteByFormId(formId: string): Promise<void> {
    await this.responseEmailModel.deleteMany({ formId }).exec();
  }
}
