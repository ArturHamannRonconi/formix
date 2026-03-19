import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { FormStatus } from '@modules/forms/domain/aggregate/value-objects/form-status.vo';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';
import { Output } from '@shared/output';
import { FormDocument, FormSchemaClass } from '../schemas/form.schema';

@Injectable()
export class MongoFormRepository implements IFormRepository {
  constructor(
    @InjectModel(FormSchemaClass.name)
    private readonly formModel: Model<FormDocument>,
  ) {}

  async save(form: FormAggregate): Promise<void> {
    await this.formModel.findOneAndUpdate(
      { _id: form.id.getValue() },
      {
        $set: {
          organizationId: form.organizationId,
          createdBy: form.createdBy,
          title: form.title,
          description: form.description,
          publicToken: form.publicToken?.getValue(),
          settings: form.settings,
          status: form.status.getValue(),
        },
        $setOnInsert: {
          _id: form.id.getValue(),
          createdAt: form.createdAt,
        },
      },
      { upsert: true },
    );
  }

  async findById(id: FormId): Promise<Output<FormAggregate>> {
    const doc = await this.formModel.findOne({ _id: id.getValue() }).exec();
    if (!doc) return Output.fail('Form not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByOrganizationId(organizationId: string, status?: string): Promise<FormAggregate[]> {
    const filter: Record<string, unknown> = { organizationId };
    if (status) filter.status = status;
    const docs = await this.formModel.find(filter).exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async findByPublicToken(publicToken: string): Promise<Output<FormAggregate>> {
    const doc = await this.formModel.findOne({ publicToken }).exec();
    if (!doc) return Output.fail('Form not found');
    return Output.ok(this.toEntity(doc));
  }

  async delete(id: FormId): Promise<void> {
    await this.formModel.deleteOne({ _id: id.getValue() }).exec();
  }

  private toEntity(doc: FormDocument): FormAggregate {
    return FormAggregate.reconstitute({
      id: FormId.from(doc._id as string),
      organizationId: doc.organizationId,
      createdBy: doc.createdBy,
      title: doc.title,
      description: doc.description,
      publicToken: doc.publicToken ? PublicToken.from(doc.publicToken) : undefined,
      settings: doc.settings,
      status: FormStatus.from(doc.status),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
