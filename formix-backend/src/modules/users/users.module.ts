import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchemaClass, UserSchema } from './infra/schemas/user.schema';
import { MongoUserRepository } from './infra/repositories/mongo-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSchemaClass.name, schema: UserSchema }])],
  providers: [{ provide: USER_REPOSITORY, useClass: MongoUserRepository }],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
