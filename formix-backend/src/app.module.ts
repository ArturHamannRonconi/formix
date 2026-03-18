import { Module } from '@nestjs/common';
import { EnvironmentModule } from '@core/environment/environment.module';
import { DatabaseModule } from '@core/database/database.module';
import { EmailModule } from '@shared/email/email.module';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [EnvironmentModule, DatabaseModule, EmailModule, UsersModule, OrganizationsModule, AuthModule],
})
export class AppModule {}
