import { Module } from '@nestjs/common';
import { GetFormAnalyticsUseCase } from './domain/usecases/get-form-analytics.usecase';
import { AnalyticsController } from './infra/controllers/analytics.controller';
import { FormsModule } from '@modules/forms/forms.module';
import { ResponsesModule } from '@modules/responses/responses.module';

@Module({
  imports: [FormsModule, ResponsesModule],
  controllers: [AnalyticsController],
  providers: [GetFormAnalyticsUseCase],
})
export class AnalyticsModule {}
