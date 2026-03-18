import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<OrganizationSchemaClass>;

@Schema({ _id: false })
export class MembershipSubSchema {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  createdAt: Date;
}

@Schema({ timestamps: true, collection: 'organizations', _id: false })
export class OrganizationSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ type: [MembershipSubSchema], default: [] })
  members: MembershipSubSchema[];

  createdAt: Date;
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(OrganizationSchemaClass);

OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ 'members.userId': 1 });
