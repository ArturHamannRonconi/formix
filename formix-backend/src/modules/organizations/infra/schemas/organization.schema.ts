import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<OrganizationSchemaClass>;

@Schema({ timestamps: true, collection: 'organizations', _id: false })
export class OrganizationSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(OrganizationSchemaClass);

OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ createdAt: -1 });
