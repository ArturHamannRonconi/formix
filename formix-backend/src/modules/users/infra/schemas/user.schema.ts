import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaClass>;

@Schema({ _id: false })
export class EmailConfirmationTokenSubSchema {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  createdAt: Date;
}

@Schema({ _id: false })
export class RefreshTokenSubSchema {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ required: true })
  family: string;

  @Prop({ type: Date, default: null })
  usedAt: Date | null;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  createdAt: Date;
}

@Schema({ _id: false })
export class PasswordResetTokenSubSchema {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  createdAt: Date;
}

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

  @Prop({ type: EmailConfirmationTokenSubSchema, default: null })
  emailConfirmationToken: EmailConfirmationTokenSubSchema | null;

  @Prop({ type: [RefreshTokenSubSchema], default: [] })
  refreshTokens: RefreshTokenSubSchema[];

  @Prop({ type: PasswordResetTokenSubSchema, default: null })
  passwordResetToken: PasswordResetTokenSubSchema | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'emailConfirmationToken.tokenHash': 1 }, { sparse: true });
UserSchema.index({ 'refreshTokens.tokenHash': 1 }, { sparse: true });
UserSchema.index({ 'passwordResetToken.tokenHash': 1 }, { sparse: true });
