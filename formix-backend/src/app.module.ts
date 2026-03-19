import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EnvironmentModule } from '@core/environment/environment.module';
import { DatabaseModule } from '@core/database/database.module';
import { EmailModule } from '@providers/email/email.module';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AuthModule } from '@modules/auth/auth.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { FormsModule } from '@modules/forms/forms.module';
import { ResponsesModule } from '@modules/responses/responses.module';
import { JwtAuthGuard } from '@modules/auth/infra/guards/jwt-auth.guard';

@Module({
  imports: [EnvironmentModule, DatabaseModule, EmailModule, UsersModule, OrganizationsModule, AuthModule, InvitationsModule, FormsModule, ResponsesModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
