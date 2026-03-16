import { Module } from '@nestjs/common';
import { EnvironmentModule } from '@core/environment/environment.module';
import { DatabaseModule } from '@core/database/database.module';

@Module({
  imports: [EnvironmentModule, DatabaseModule],
})
export class AppModule {}
