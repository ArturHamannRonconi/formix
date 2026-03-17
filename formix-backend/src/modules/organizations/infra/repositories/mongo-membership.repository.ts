import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership } from '@modules/organizations/domain/aggregate/entities/membership.entity';
import { IMembershipRepository } from '@modules/organizations/domain/repositories/membership.repository';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';
import { MembershipDocument, MembershipSchemaClass } from '../schemas/membership.schema';

@Injectable()
export class MongoMembershipRepository implements IMembershipRepository {
  constructor(
    @InjectModel(MembershipSchemaClass.name)
    private readonly membershipModel: Model<MembershipDocument>,
  ) {}

  async findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null> {
    const doc = await this.membershipModel.findOne({ userId, organizationId }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByOrganizationId(organizationId: string): Promise<Membership[]> {
    const docs = await this.membershipModel.find({ organizationId }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const docs = await this.membershipModel.find({ userId }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(membership: Membership): Promise<void> {
    await this.membershipModel.findOneAndUpdate(
      { _id: membership.id },
      {
        $set: {
          userId: membership.userId,
          organizationId: membership.organizationId,
          role: membership.role,
          createdAt: membership.createdAt,
        },
        $setOnInsert: { _id: membership.id },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async delete(id: string): Promise<void> {
    await this.membershipModel.deleteOne({ _id: id }).exec();
  }

  async countAdminsByOrganization(organizationId: string): Promise<number> {
    return this.membershipModel
      .countDocuments({ organizationId, role: MemberRole.ADMIN })
      .exec();
  }

  private toEntity(doc: MembershipDocument): Membership {
    return Membership.reconstitute({
      id: doc._id as string,
      userId: doc.userId,
      organizationId: doc.organizationId,
      role: doc.role,
      createdAt: doc.createdAt,
    });
  }
}
