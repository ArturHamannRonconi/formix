import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@modules/users/domain/aggregate/user.aggregate';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { EmailConfirmationTokenId } from '@modules/users/domain/aggregate/value-objects/email-confirmation-token-id.vo';
import { EmailConfirmationTokenEntity } from '@modules/users/domain/aggregate/entities/email-confirmation-token.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { Output } from '@shared/output';
import { UserDocument, UserSchemaClass } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<void> {
    const token = user.emailConfirmationToken;
    await this.userModel.findOneAndUpdate(
      { _id: user.id.getValue() },
      {
        $set: {
          name: user.name,
          email: user.email.getValue(),
          passwordHash: user.passwordHash.getHash(),
          emailConfirmed: user.emailConfirmed,
          emailConfirmationToken: token
            ? {
                _id: token.id.getValue(),
                tokenHash: token.tokenHash,
                expiresAt: token.expiresAt,
                createdAt: token.createdAt,
              }
            : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        $setOnInsert: { _id: user.id.getValue() },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async findById(id: UserId): Promise<Output<User>> {
    const doc = await this.userModel.findOne({ _id: id.getValue() }).exec();
    if (!doc) return Output.fail('User not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByEmail(email: Email): Promise<Output<User>> {
    const doc = await this.userModel.findOne({ email: email.getValue() }).exec();
    if (!doc) return Output.fail('User not found');
    return Output.ok(this.toEntity(doc));
  }

  async findByEmailConfirmationTokenHash(tokenHash: string): Promise<Output<User>> {
    const doc = await this.userModel
      .findOne({ 'emailConfirmationToken.tokenHash': tokenHash })
      .exec();
    if (!doc) return Output.fail('User not found');
    return Output.ok(this.toEntity(doc));
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email: email.getValue() }).exec();
    return count > 0;
  }

  private toEntity(doc: UserDocument): User {
    return User.reconstitute({
      id: UserId.from(doc._id as string),
      name: doc.name,
      email: Email.create(doc.email),
      passwordHash: Password.fromHash(doc.passwordHash),
      emailConfirmed: doc.emailConfirmed,
      emailConfirmationToken: doc.emailConfirmationToken
        ? EmailConfirmationTokenEntity.reconstitute({
            id: EmailConfirmationTokenId.from(doc.emailConfirmationToken._id),
            tokenHash: doc.emailConfirmationToken.tokenHash,
            expiresAt: doc.emailConfirmationToken.expiresAt,
            createdAt: doc.emailConfirmationToken.createdAt,
          })
        : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
