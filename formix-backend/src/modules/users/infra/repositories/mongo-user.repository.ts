import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@modules/users/domain/aggregate/entities/user.entity';
import { IUserRepository } from '@modules/users/domain/repositories/user.repository';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';
import { UserDocument, UserSchemaClass } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ _id: id }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async save(user: User): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          name: user.name,
          email: user.email.getValue(),
          passwordHash: user.passwordHash.getHash(),
          emailConfirmed: user.emailConfirmed,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        $setOnInsert: { _id: user.id },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email: email.toLowerCase() }).exec();
    return count > 0;
  }

  private toEntity(doc: UserDocument): User {
    return User.reconstitute({
      id: doc._id as string,
      name: doc.name,
      email: Email.create(doc.email),
      passwordHash: Password.fromHash(doc.passwordHash),
      emailConfirmed: doc.emailConfirmed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
