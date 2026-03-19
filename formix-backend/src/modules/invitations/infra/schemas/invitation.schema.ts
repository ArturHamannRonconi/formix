import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InvitationDocument = HydratedDocument<InvitationSchemaClass>;

@Schema({ timestamps: true, collection: 'invitations', _id: false })
export class InvitationSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ required: true, default: 'member' })
  role: string;

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ required: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(InvitationSchemaClass);

InvitationSchema.index({ tokenHash: 1 }, { unique: true });
InvitationSchema.index({ organizationId: 1, email: 1, status: 1 });
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
