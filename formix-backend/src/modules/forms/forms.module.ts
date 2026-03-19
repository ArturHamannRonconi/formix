import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSchemaClass, FormSchema } from './infra/schemas/form.schema';
import { QuestionSchemaClass, QuestionSchema } from './infra/schemas/question.schema';
import { MongoFormRepository } from './infra/repositories/mongo-form.repository';
import { MongoQuestionRepository } from './infra/repositories/mongo-question.repository';
import { FORM_REPOSITORY } from './domain/repositories/form.repository';
import { QUESTION_REPOSITORY } from './domain/repositories/question.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormSchemaClass.name, schema: FormSchema },
      { name: QuestionSchemaClass.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [],
  providers: [
    { provide: FORM_REPOSITORY, useClass: MongoFormRepository },
    { provide: QUESTION_REPOSITORY, useClass: MongoQuestionRepository },
  ],
  exports: [FORM_REPOSITORY, QUESTION_REPOSITORY],
})
export class FormsModule {}
