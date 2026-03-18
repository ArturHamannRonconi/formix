import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { IOrganizationRepository } from '@modules/organizations/domain/repositories/organization.repository';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { MembershipId } from '@modules/organizations/domain/aggregate/value-objects/membership-id.vo';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { MembershipEntity } from '@modules/organizations/domain/aggregate/entities/membership.entity';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';
import { Output } from '@shared/output';
import { OrganizationDocument, OrganizationSchemaClass } from '../schemas/organization.schema';

@Injectable()
export class MongoOrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectModel(OrganizationSchemaClass.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async save(org: Organization): Promise<void> {
    await this.orgModel.findOneAndUpdate(
      { _id: org.id.getValue() },
      {
        $set: {
          name: org.name,
          slug: org.slug.getValue(),
          members: org.members.map(m => ({
            _id: m.id.getValue(),
            userId: m.userId.getValue(),
            role: m.role,
            createdAt: m.createdAt,
          })),
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        },
        $setOnInsert: { _id: org.id.getValue() },
      },
      { upsert: true },
    );
  }

  async findById(id: OrganizationId): Promise<Output<Organization>> {
    const doc = await this.orgModel.findOne({ _id: id.getValue() }).exec();
    if (!doc) return Output.fail('Organization not found');
    return Output.ok(this.toEntity(doc));
  }

  async findBySlug(slug: Slug): Promise<Output<Organization>> {
    const doc = await this.orgModel.findOne({ slug: slug.getValue() }).exec();
    if (!doc) return Output.fail('Organization not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByMemberId(userId: UserId): Promise<Organization[]> {
    const docs = await this.orgModel.find({ 'members.userId': userId.getValue() }).exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    const count = await this.orgModel.countDocuments({ slug: slug.getValue() }).exec();
    return count > 0;
  }

  private toEntity(doc: OrganizationDocument): Organization {
    return Organization.reconstitute({
      id: OrganizationId.from(doc._id as string),
      name: doc.name,
      slug: Slug.create(doc.slug),
      members: doc.members.map(m =>
        MembershipEntity.reconstitute({
          id: MembershipId.from(m._id),
          userId: UserId.from(m.userId),
          role: m.role as MemberRole,
          createdAt: m.createdAt,
        }),
      ),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
