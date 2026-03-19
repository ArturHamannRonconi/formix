import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IInvitationRepository } from '@modules/invitations/domain/repositories/invitation.repository';
import { Invitation } from '@modules/invitations/domain/aggregate/invitation.aggregate';
import { InvitationId } from '@modules/invitations/domain/aggregate/value-objects/invitation-id.vo';
import { InvitationStatus } from '@modules/invitations/domain/aggregate/value-objects/invitation-status.vo';
import { Output } from '@shared/output';
import { InvitationDocument, InvitationSchemaClass } from '../schemas/invitation.schema';

@Injectable()
export class MongoInvitationRepository implements IInvitationRepository {
  constructor(
    @InjectModel(InvitationSchemaClass.name)
    private readonly invitationModel: Model<InvitationDocument>,
  ) {}

  async save(invitation: Invitation): Promise<void> {
    await this.invitationModel.findOneAndUpdate(
      { _id: invitation.id.getValue() },
      {
        $set: {
          organizationId: invitation.organizationId,
          email: invitation.email,
          tokenHash: invitation.tokenHash,
          role: invitation.role,
          status: invitation.status.getValue(),
          expiresAt: invitation.expiresAt,
          updatedAt: invitation.updatedAt,
        },
        $setOnInsert: {
          _id: invitation.id.getValue(),
          createdAt: invitation.createdAt,
        },
      },
      { upsert: true },
    );
  }

  async findById(id: InvitationId): Promise<Output<Invitation>> {
    const doc = await this.invitationModel.findOne({ _id: id.getValue() }).exec();
    if (!doc) return Output.fail('Invitation not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByTokenHash(tokenHash: string): Promise<Output<Invitation>> {
    const doc = await this.invitationModel.findOne({ tokenHash }).exec();
    if (!doc) return Output.fail('Invitation not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByOrganizationId(organizationId: string): Promise<Invitation[]> {
    const docs = await this.invitationModel.find({ organizationId }).exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async findPendingByEmailAndOrg(email: string, organizationId: string): Promise<Invitation | null> {
    const doc = await this.invitationModel
      .findOne({ email: email.toLowerCase(), organizationId, status: 'pending' })
      .exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async delete(id: InvitationId): Promise<void> {
    await this.invitationModel.deleteOne({ _id: id.getValue() }).exec();
  }

  private toEntity(doc: InvitationDocument): Invitation {
    return Invitation.reconstitute({
      id: InvitationId.from(doc._id as string),
      organizationId: doc.organizationId,
      email: doc.email,
      tokenHash: doc.tokenHash,
      role: doc.role as 'member',
      status: InvitationStatus.from(doc.status),
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
