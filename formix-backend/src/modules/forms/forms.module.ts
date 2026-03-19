import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSchemaClass, FormSchema } from './infra/schemas/form.schema';
import { QuestionSchemaClass, QuestionSchema } from './infra/schemas/question.schema';
import { MongoFormRepository } from './infra/repositories/mongo-form.repository';
import { MongoQuestionRepository } from './infra/repositories/mongo-question.repository';
import { FORM_REPOSITORY } from './domain/repositories/form.repository';
import { QUESTION_REPOSITORY } from './domain/repositories/question.repository';
import { CreateFormUseCase } from './domain/usecases/create-form.usecase';
import { ListFormsUseCase } from './domain/usecases/list-forms.usecase';
import { GetFormUseCase } from './domain/usecases/get-form.usecase';
import { UpdateFormUseCase } from './domain/usecases/update-form.usecase';
import { DeleteFormUseCase } from './domain/usecases/delete-form.usecase';
import { AddQuestionUseCase } from './domain/usecases/add-question.usecase';
import { UpdateQuestionUseCase } from './domain/usecases/update-question.usecase';
import { RemoveQuestionUseCase } from './domain/usecases/remove-question.usecase';
import { ReorderQuestionsUseCase } from './domain/usecases/reorder-questions.usecase';
import { PublishFormUseCase } from './domain/usecases/publish-form.usecase';
import { CloseFormUseCase } from './domain/usecases/close-form.usecase';
import { FormsController } from './infra/controllers/forms.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormSchemaClass.name, schema: FormSchema },
      { name: QuestionSchemaClass.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [FormsController],
  providers: [
    { provide: FORM_REPOSITORY, useClass: MongoFormRepository },
    { provide: QUESTION_REPOSITORY, useClass: MongoQuestionRepository },
    CreateFormUseCase,
    ListFormsUseCase,
    GetFormUseCase,
    UpdateFormUseCase,
    DeleteFormUseCase,
    AddQuestionUseCase,
    UpdateQuestionUseCase,
    RemoveQuestionUseCase,
    ReorderQuestionsUseCase,
    PublishFormUseCase,
    CloseFormUseCase,
  ],
  exports: [FORM_REPOSITORY, QUESTION_REPOSITORY],
})
export class FormsModule {}
