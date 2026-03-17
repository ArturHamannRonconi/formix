import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationSchemaClass, OrganizationSchema } from './infra/schemas/organization.schema';
import { MembershipSchemaClass, MembershipSchema } from './infra/schemas/membership.schema';
import { MongoOrganizationRepository } from './infra/repositories/mongo-organization.repository';
import { MongoMembershipRepository } from './infra/repositories/mongo-membership.repository';
import { ORGANIZATION_REPOSITORY } from './domain/repositories/organization.repository';
import { MEMBERSHIP_REPOSITORY } from './domain/repositories/membership.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationSchemaClass.name, schema: OrganizationSchema },
      { name: MembershipSchemaClass.name, schema: MembershipSchema },
    ]),
  ],
  providers: [
    { provide: ORGANIZATION_REPOSITORY, useClass: MongoOrganizationRepository },
    { provide: MEMBERSHIP_REPOSITORY, useClass: MongoMembershipRepository },
  ],
  exports: [ORGANIZATION_REPOSITORY, MEMBERSHIP_REPOSITORY],
})
export class OrganizationsModule {}
