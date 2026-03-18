import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchemaClass, UserSchema } from './infra/schemas/user.schema';
import { MongoUserRepository } from './infra/repositories/mongo-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { GetProfileUseCase } from './domain/usecases/get-profile.usecase';
import { UpdateProfileUseCase } from './domain/usecases/update-profile.usecase';
import { UsersController } from './infra/controllers/users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserSchemaClass.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: MongoUserRepository },
    GetProfileUseCase,
    UpdateProfileUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
