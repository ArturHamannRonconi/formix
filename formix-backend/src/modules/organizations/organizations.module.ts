import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationSchemaClass, OrganizationSchema } from './infra/schemas/organization.schema';
import { MongoOrganizationRepository } from './infra/repositories/mongo-organization.repository';
import { ORGANIZATION_REPOSITORY } from './domain/repositories/organization.repository';
import { ListMembersUseCase } from './domain/usecases/list-members.usecase';
import { RemoveMemberUseCase } from './domain/usecases/remove-member.usecase';
import { OrganizationsController } from './infra/controllers/organizations.controller';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrganizationSchemaClass.name, schema: OrganizationSchema }]),
    UsersModule,
  ],
  controllers: [OrganizationsController],
  providers: [
    { provide: ORGANIZATION_REPOSITORY, useClass: MongoOrganizationRepository },
    ListMembersUseCase,
    RemoveMemberUseCase,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationsModule {}
