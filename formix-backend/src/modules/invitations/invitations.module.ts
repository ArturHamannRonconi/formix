import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvitationSchemaClass, InvitationSchema } from './infra/schemas/invitation.schema';
import { MongoInvitationRepository } from './infra/repositories/mongo-invitation.repository';
import { INVITATION_REPOSITORY } from './domain/repositories/invitation.repository';
import { CreateInvitationUseCase, INVITATION_EXPIRES_IN_MS, INVITATION_APP_URL } from './domain/usecases/create-invitation.usecase';
import { AcceptInvitationUseCase, ACCEPT_INVITATION_JWT_SIGN_FUNCTION, ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS } from './domain/usecases/accept-invitation.usecase';
import { ListInvitationsUseCase } from './domain/usecases/list-invitations.usecase';
import { ResendInvitationUseCase, RESEND_INVITATION_EXPIRES_IN_MS, RESEND_INVITATION_APP_URL } from './domain/usecases/resend-invitation.usecase';
import { CancelInvitationUseCase } from './domain/usecases/cancel-invitation.usecase';
import { InvitationsController } from './infra/controllers/invitations.controller';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { EmailModule } from '@providers/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InvitationSchemaClass.name, schema: InvitationSchema }]),
    UsersModule,
    OrganizationsModule,
    EmailModule,
    JwtModule,
  ],
  controllers: [InvitationsController],
  providers: [
    { provide: INVITATION_REPOSITORY, useClass: MongoInvitationRepository },
    CreateInvitationUseCase,
    AcceptInvitationUseCase,
    ListInvitationsUseCase,
    ResendInvitationUseCase,
    CancelInvitationUseCase,
    {
      provide: INVITATION_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) =>
        config.get<number>('INVITATION_EXPIRES_IN', 604800000),
      inject: [ConfigService],
    },
    {
      provide: INVITATION_APP_URL,
      useFactory: (config: ConfigService) =>
        config.get<string>('APP_URL', 'http://localhost:3000'),
      inject: [ConfigService],
    },
    {
      provide: RESEND_INVITATION_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) =>
        config.get<number>('INVITATION_EXPIRES_IN', 604800000),
      inject: [ConfigService],
    },
    {
      provide: RESEND_INVITATION_APP_URL,
      useFactory: (config: ConfigService) =>
        config.get<string>('APP_URL', 'http://localhost:3000'),
      inject: [ConfigService],
    },
    {
      provide: ACCEPT_INVITATION_JWT_SIGN_FUNCTION,
      useFactory: (jwtService: JwtService) => jwtService.sign.bind(jwtService),
      inject: [JwtService],
    },
    {
      provide: ACCEPT_INVITATION_REFRESH_TOKEN_EXPIRES_IN_MS,
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
        const match = expiresIn.match(/^(\d+)([smhdwy])$/);
        if (!match) return 604800000;
        const [, num, unit] = match;
        const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31536000000 };
        return parseInt(num) * (multipliers[unit] ?? 604800000);
      },
      inject: [ConfigService],
    },
  ],
  exports: [INVITATION_REPOSITORY],
})
export class InvitationsModule {}
