import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationSchemaClass, InvitationSchema } from './infra/schemas/invitation.schema';
import { MongoInvitationRepository } from './infra/repositories/mongo-invitation.repository';
import { INVITATION_REPOSITORY } from './domain/repositories/invitation.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InvitationSchemaClass.name, schema: InvitationSchema }]),
  ],
  controllers: [],
  providers: [
    { provide: INVITATION_REPOSITORY, useClass: MongoInvitationRepository },
  ],
  exports: [INVITATION_REPOSITORY],
})
export class InvitationsModule {}
