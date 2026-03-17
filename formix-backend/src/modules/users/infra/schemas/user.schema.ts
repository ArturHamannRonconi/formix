import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaClass>;

@Schema({ timestamps: true, collection: 'users', _id: false })
export class UserSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, default: false })
  emailConfirmed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
