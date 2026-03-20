import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQuestionRepository } from '@modules/forms/domain/repositories/question.repository';
import { QuestionEntity } from '@modules/forms/domain/aggregate/question.entity';
import { QuestionId } from '@modules/forms/domain/aggregate/value-objects/question-id.vo';
import { Output } from '@shared/output';
import { QuestionDocument, QuestionSchemaClass } from '../schemas/question.schema';
import { QuestionMapper, QuestionSchemaDto } from './question.mapper';

@Injectable()
export class MongoQuestionRepository implements IQuestionRepository {
  constructor(
    @InjectModel(QuestionSchemaClass.name)
    private readonly questionModel: Model<QuestionDocument>,
    private readonly questionMapper: QuestionMapper,
  ) {}

  async save(question: QuestionEntity): Promise<void> {
    const dto = this.questionMapper.toRight(question);

    const alreadyExists = await this.questionModel.exists({ _id: dto._id });

    if (!alreadyExists) {
      await this.questionModel.create(dto);
      return;
    }

    await this.questionModel.replaceOne({ _id: dto._id }, dto);
  }

  async findById(id: QuestionId): Promise<Output<QuestionEntity>> {
    const doc = await this.questionModel.findOne({ _id: id.getValue() }).lean().exec();
    if (!doc) return Output.fail('Question not found');
    return Output.ok(this.questionMapper.toLeft(doc as unknown as QuestionSchemaDto));
  }

  async findByFormId(formId: string): Promise<QuestionEntity[]> {
    const docs = await this.questionModel.find({ formId }).lean().exec();
    return docs.map((doc) => this.questionMapper.toLeft(doc as unknown as QuestionSchemaDto));
  }

  async findByFormIdOrdered(formId: string): Promise<QuestionEntity[]> {
    const docs = await this.questionModel.find({ formId }).sort({ order: 1 }).lean().exec();
    return docs.map((doc) => this.questionMapper.toLeft(doc as unknown as QuestionSchemaDto));
  }

  async countByFormId(formId: string): Promise<number> {
    return this.questionModel.countDocuments({ formId }).exec();
  }

  async delete(id: QuestionId): Promise<void> {
    await this.questionModel.deleteOne({ _id: id.getValue() }).exec();
  }

  async deleteByFormId(formId: string): Promise<void> {
    await this.questionModel.deleteMany({ formId }).exec();
  }
}
