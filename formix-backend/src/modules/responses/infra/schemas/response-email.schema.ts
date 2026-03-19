import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResponseEmailDocument = HydratedDocument<ResponseEmailSchemaClass>;

@Schema({ timestamps: false, collection: 'response_emails', _id: false })
export class ResponseEmailSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  formId: string;

  @Prop({ required: true })
  emailHash: string;

  @Prop({ required: true, default: () => new Date() })
  respondedAt: Date;
}

export const ResponseEmailSchema = SchemaFactory.createForClass(ResponseEmailSchemaClass);

ResponseEmailSchema.index({ formId: 1, emailHash: 1 }, { unique: true });
