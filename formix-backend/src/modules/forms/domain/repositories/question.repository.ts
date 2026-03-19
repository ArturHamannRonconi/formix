import { QuestionEntity } from '../aggregate/question.entity';
import { QuestionId } from '../aggregate/value-objects/question-id.vo';
import { Output } from '@shared/output';

export interface IQuestionRepository {
  save(question: QuestionEntity): Promise<void>;
  findById(id: QuestionId): Promise<Output<QuestionEntity>>;
  findByFormId(formId: string): Promise<QuestionEntity[]>;
  findByFormIdOrdered(formId: string): Promise<QuestionEntity[]>;
  countByFormId(formId: string): Promise<number>;
  delete(id: QuestionId): Promise<void>;
  deleteByFormId(formId: string): Promise<void>;
}

export const QUESTION_REPOSITORY = Symbol('QUESTION_REPOSITORY');
