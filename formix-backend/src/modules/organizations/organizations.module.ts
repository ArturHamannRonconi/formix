import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationSchemaClass, OrganizationSchema } from './infra/schemas/organization.schema';
import { MongoOrganizationRepository } from './infra/repositories/mongo-organization.repository';
import { ORGANIZATION_REPOSITORY } from './domain/repositories/organization.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrganizationSchemaClass.name, schema: OrganizationSchema }]),
  ],
  providers: [{ provide: ORGANIZATION_REPOSITORY, useClass: MongoOrganizationRepository }],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationsModule {}
