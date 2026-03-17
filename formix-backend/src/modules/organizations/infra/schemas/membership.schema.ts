import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';

export type MembershipDocument = HydratedDocument<MembershipSchemaClass>;

@Schema({ collection: 'memberships', _id: false })
export class MembershipSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, ref: 'users' })
  userId: string;

  @Prop({ type: String, required: true, ref: 'organizations' })
  organizationId: string;

  @Prop({ required: true, enum: Object.values(MemberRole) })
  role: MemberRole;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(MembershipSchemaClass);

MembershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
