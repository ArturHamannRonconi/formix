import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<QuestionSchemaClass>;

@Schema({ timestamps: false, collection: 'questions', _id: false })
export class QuestionSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  formId: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  label: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: false })
  required: boolean;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ type: [String] })
  options?: string[];

  @Prop({ type: Object })
  validation?: { min?: number; max?: number; pattern?: string };

  @Prop({ required: true })
  createdAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(QuestionSchemaClass);

QuestionSchema.index({ formId: 1, order: 1 });
QuestionSchema.index({ organizationId: 1 });
