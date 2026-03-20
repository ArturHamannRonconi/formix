import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import {
  IResponseRepository,
  FindByFormIdOptions,
} from '@modules/responses/domain/repositories/response.repository';
import { ResponseAggregate } from '@modules/responses/domain/aggregate/response.aggregate';
import { ResponseDocument, ResponseSchemaClass } from '../schemas/response.schema';
import { ResponseMapper, ResponseSchemaDto } from './response.mapper';

@Injectable()
export class MongoResponseRepository implements IResponseRepository {
  constructor(
    @InjectModel(ResponseSchemaClass.name)
    private readonly responseModel: Model<ResponseDocument>,
    private readonly responseMapper: ResponseMapper,
  ) {}

  async save(response: ResponseAggregate): Promise<void> {
    const dto = this.responseMapper.toRight(response);

    const alreadyExists = await this.responseModel.exists({ _id: dto._id });

    if (!alreadyExists) {
      await this.responseModel.create(dto);
      return;
    }

    await this.responseModel.replaceOne({ _id: dto._id }, dto);
  }

  async findByFormId(formId: string, options?: FindByFormIdOptions): Promise<ResponseAggregate[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy ?? 'date';
    const sortDir: 1 | -1 = options?.sortDir === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [];

    const matchStage: Record<string, unknown> = { formId };
    if (search) {
      matchStage['$or'] = [{ 'answers.value': { $regex: search, $options: 'i' } }];
    }
    pipeline.push({ $match: matchStage });

    if (sortBy === 'date') {
      pipeline.push({ $sort: { submittedAt: sortDir } });
    } else {
      pipeline.push({
        $addFields: {
          _sortValue: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$answers',
                      cond: { $eq: ['$$this.questionId', sortBy] },
                    },
                  },
                  as: 'ans',
                  in: '$$ans.value',
                },
              },
              0,
            ],
          },
        },
      });
      pipeline.push({ $sort: { _sortValue: sortDir } });
      pipeline.push({ $project: { _sortValue: 0 } });
    }

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    const docs = await this.responseModel
      .aggregate<ResponseSchemaDto>(pipeline)
      .exec();

    return docs.map((doc) => this.responseMapper.toLeft(doc));
  }

  async findAllByFormId(formId: string): Promise<ResponseAggregate[]> {
    const docs = await this.responseModel
      .find({ formId })
      .sort({ submittedAt: 1 })
      .lean()
      .exec();

    return docs.map((doc) => this.responseMapper.toLeft(doc as unknown as ResponseSchemaDto));
  }

  async countByFormId(formId: string, search?: string): Promise<number> {
    const match: Record<string, unknown> = { formId };
    if (search?.trim()) {
      match['$or'] = [{ 'answers.value': { $regex: search.trim(), $options: 'i' } }];
    }

    if (!search?.trim()) {
      return this.responseModel.countDocuments({ formId }).exec();
    }

    const result = await this.responseModel
      .aggregate<{ total: number }>([{ $match: match }, { $count: 'total' }])
      .exec();

    return result[0]?.total ?? 0;
  }

  async deleteByFormId(formId: string): Promise<void> {
    await this.responseModel.deleteMany({ formId }).exec();
  }
}
