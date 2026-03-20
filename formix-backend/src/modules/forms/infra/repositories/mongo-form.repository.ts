import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { Output } from '@shared/output';
import { FormDocument, FormSchemaClass } from '../schemas/form.schema';
import { FormMapper, FormSchemaDto } from './form.mapper';

@Injectable()
export class MongoFormRepository implements IFormRepository {
  constructor(
    @InjectModel(FormSchemaClass.name)
    private readonly formModel: Model<FormDocument>,
    private readonly formMapper: FormMapper,
  ) {}

  async save(form: FormAggregate): Promise<void> {
    const dto = this.formMapper.toRight(form);

    const alreadyExists = await this.formModel.exists({ _id: dto._id });

    if (!alreadyExists) {
      await this.formModel.create(dto);
      return;
    }

    dto.updatedAt = new Date();
    await this.formModel.replaceOne({ _id: dto._id }, dto);
  }

  async findById(id: FormId): Promise<Output<FormAggregate>> {
    const doc = await this.formModel.findOne({ _id: id.getValue() }).lean().exec();
    if (!doc) return Output.fail('Form not found');
    return Output.ok(this.formMapper.toLeft(doc as unknown as FormSchemaDto));
  }

  async findByOrganizationId(organizationId: string, status?: string): Promise<FormAggregate[]> {
    const filter: Record<string, unknown> = { organizationId };
    if (status) filter.status = status;
    const docs = await this.formModel.find(filter).lean().exec();
    return docs.map((doc) => this.formMapper.toLeft(doc as unknown as FormSchemaDto));
  }

  async findByPublicToken(publicToken: string): Promise<Output<FormAggregate>> {
    const doc = await this.formModel.findOne({ publicToken }).lean().exec();
    if (!doc) return Output.fail('Form not found');
    return Output.ok(this.formMapper.toLeft(doc as unknown as FormSchemaDto));
  }

  async delete(id: FormId): Promise<void> {
    await this.formModel.deleteOne({ _id: id.getValue() }).exec();
  }
}
