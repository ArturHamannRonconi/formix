import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FormDocument = HydratedDocument<FormSchemaClass>;

@Schema({ timestamps: true, collection: 'forms', _id: false })
export class FormSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  publicToken?: string;

  @Prop({
    type: Object,
    default: { allowMultipleResponses: false, allowedEmailDomains: [] },
  })
  settings: {
    expiresAt?: Date;
    maxResponses?: number;
    allowMultipleResponses: boolean;
    allowedEmailDomains: string[];
  };

  @Prop({ required: true, default: 'draft' })
  status: string;

  createdAt: Date;
  updatedAt: Date;
}

export const FormSchema = SchemaFactory.createForClass(FormSchemaClass);

FormSchema.index({ organizationId: 1 });
FormSchema.index({ publicToken: 1 }, { unique: true, sparse: true });
FormSchema.index({ organizationId: 1, status: 1 });
