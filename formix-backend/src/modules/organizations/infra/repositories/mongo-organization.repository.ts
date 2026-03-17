import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '@modules/organizations/domain/aggregate/entities/organization.entity';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { OrganizationDocument, OrganizationSchemaClass } from '../schemas/organization.schema';

@Injectable()
export class MongoOrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectModel(OrganizationSchemaClass.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async findById(id: string): Promise<Organization | null> {
    const doc = await this.orgModel.findOne({ _id: id }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const doc = await this.orgModel.findOne({ slug }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async save(org: Organization): Promise<void> {
    await this.orgModel.findOneAndUpdate(
      { _id: org.id },
      {
        $set: {
          name: org.name,
          slug: org.slug.getValue(),
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        },
        $setOnInsert: { _id: org.id },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.orgModel.countDocuments({ slug }).exec();
    return count > 0;
  }

  private toEntity(doc: OrganizationDocument): Organization {
    return Organization.reconstitute({
      id: doc._id as string,
      name: doc.name,
      slug: Slug.create(doc.slug),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
