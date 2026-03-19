import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseSchemaClass, ResponseSchema } from './infra/schemas/response.schema';
import { ResponseEmailSchemaClass, ResponseEmailSchema } from './infra/schemas/response-email.schema';
import { MongoResponseRepository } from './infra/repositories/mongo-response.repository';
import { MongoResponseEmailRepository } from './infra/repositories/mongo-response-email.repository';
import { RESPONSE_REPOSITORY } from './domain/repositories/response.repository';
import { RESPONSE_EMAIL_REPOSITORY } from './domain/repositories/response-email.repository';
import { SubmitResponseUseCase } from './domain/usecases/submit-response.usecase';
import { ListResponsesUseCase } from './domain/usecases/list-responses.usecase';
import { ResponsesController } from './infra/controllers/responses.controller';
import { FormsModule } from '@modules/forms/forms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResponseSchemaClass.name, schema: ResponseSchema },
      { name: ResponseEmailSchemaClass.name, schema: ResponseEmailSchema },
    ]),
    FormsModule,
  ],
  controllers: [ResponsesController],
  providers: [
    { provide: RESPONSE_REPOSITORY, useClass: MongoResponseRepository },
    { provide: RESPONSE_EMAIL_REPOSITORY, useClass: MongoResponseEmailRepository },
    SubmitResponseUseCase,
    ListResponsesUseCase,
  ],
  exports: [RESPONSE_REPOSITORY, RESPONSE_EMAIL_REPOSITORY],
})
export class ResponsesModule {}
