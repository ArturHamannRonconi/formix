import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResponseDocument = HydratedDocument<ResponseSchemaClass>;

@Schema({ timestamps: false, collection: 'responses', _id: false })
export class ResponseSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  formId: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({
    type: [{ questionId: String, value: Object }],
    required: true,
    default: [],
  })
  answers: { questionId: string; value: unknown }[];

  @Prop({ required: true, default: () => new Date() })
  submittedAt: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(ResponseSchemaClass);

ResponseSchema.index({ formId: 1 });
ResponseSchema.index({ formId: 1, submittedAt: -1 });
ResponseSchema.index({ organizationId: 1 });
