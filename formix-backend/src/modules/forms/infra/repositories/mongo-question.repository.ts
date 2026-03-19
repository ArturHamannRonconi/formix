import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IQuestionRepository } from '@modules/forms/domain/repositories/question.repository';
import { QuestionEntity } from '@modules/forms/domain/aggregate/question.entity';
import { QuestionId } from '@modules/forms/domain/aggregate/value-objects/question-id.vo';
import { QuestionType } from '@modules/forms/domain/aggregate/value-objects/question-type.vo';
import { Output } from '@shared/output';
import { QuestionDocument, QuestionSchemaClass } from '../schemas/question.schema';

@Injectable()
export class MongoQuestionRepository implements IQuestionRepository {
  constructor(
    @InjectModel(QuestionSchemaClass.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async save(question: QuestionEntity): Promise<void> {
    await this.questionModel.findOneAndUpdate(
      { _id: question.id.getValue() },
      {
        $set: {
          formId: question.formId,
          organizationId: question.organizationId,
          type: question.type.getValue(),
          label: question.label,
          description: question.description,
          required: question.required,
          order: question.order,
          options: question.options,
          validation: question.validation,
        },
        $setOnInsert: {
          _id: question.id.getValue(),
          createdAt: question.createdAt,
        },
      },
      { upsert: true },
    );
  }

  async findById(id: QuestionId): Promise<Output<QuestionEntity>> {
    const doc = await this.questionModel.findOne({ _id: id.getValue() }).exec();
    if (!doc) return Output.fail('Question not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByFormId(formId: string): Promise<QuestionEntity[]> {
    const docs = await this.questionModel.find({ formId }).exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async findByFormIdOrdered(formId: string): Promise<QuestionEntity[]> {
    const docs = await this.questionModel.find({ formId }).sort({ order: 1 }).exec();
    return docs.map(doc => this.toEntity(doc));
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

  private toEntity(doc: QuestionDocument): QuestionEntity {
    return QuestionEntity.reconstitute({
      id: QuestionId.from(doc._id as string),
      formId: doc.formId,
      organizationId: doc.organizationId,
      type: QuestionType.from(doc.type),
      label: doc.label,
      description: doc.description,
      required: doc.required,
      order: doc.order,
      options: doc.options,
      validation: doc.validation,
      createdAt: doc.createdAt,
    });
  }
}
