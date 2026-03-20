import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoQuestionRepository } from './mongo-question.repository';
import { QuestionMapper } from './question.mapper';
import { QuestionSchemaClass, QuestionSchema } from '../schemas/question.schema';
import { QuestionEntity } from '@modules/forms/domain/aggregate/question.entity';
import { QuestionId } from '@modules/forms/domain/aggregate/value-objects/question-id.vo';

describe('MongoQuestionRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoQuestionRepository;

  const makeQuestion = (overrides: Partial<{ formId: string; order: number }> = {}) =>
    QuestionEntity.create({
      formId: overrides.formId ?? 'form-123',
      organizationId: 'org-123',
      type: 'text',
      label: 'What is your name?',
      required: false,
      order: overrides.order ?? 0,
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: QuestionSchemaClass.name, schema: QuestionSchema }]),
      ],
      providers: [QuestionMapper, MongoQuestionRepository],
    }).compile();

    repo = module.get(MongoQuestionRepository);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should save and findById', async () => {
    const question = makeQuestion();
    await repo.save(question);
    const result = await repo.findById(question.id);
    expect(result.isFailure).toBe(false);
    expect(result.value.id.getValue()).toBe(question.id.getValue());
    expect(result.value.label).toBe(question.label);
  });

  it('should return failure when findById not found', async () => {
    const result = await repo.findById(QuestionId.create());
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Question not found');
  });

  it('should findByFormIdOrdered returns questions sorted by order', async () => {
    const formId = 'form-ordered-test';
    const q1 = makeQuestion({ formId, order: 2 });
    const q2 = makeQuestion({ formId, order: 0 });
    const q3 = makeQuestion({ formId, order: 1 });
    await repo.save(q1);
    await repo.save(q2);
    await repo.save(q3);

    const results = await repo.findByFormIdOrdered(formId);
    expect(results.length).toBe(3);
    expect(results[0].order).toBe(0);
    expect(results[1].order).toBe(1);
    expect(results[2].order).toBe(2);
  });

  it('should countByFormId', async () => {
    const formId = 'form-count-test';
    await repo.save(makeQuestion({ formId, order: 0 }));
    await repo.save(makeQuestion({ formId, order: 1 }));
    await repo.save(makeQuestion({ formId, order: 2 }));

    const count = await repo.countByFormId(formId);
    expect(count).toBe(3);
  });

  it('should deleteByFormId removes all questions for a form', async () => {
    const formId = 'form-delete-test';
    await repo.save(makeQuestion({ formId, order: 0 }));
    await repo.save(makeQuestion({ formId, order: 1 }));

    await repo.deleteByFormId(formId);
    const results = await repo.findByFormId(formId);
    expect(results.length).toBe(0);
  });

  it('should delete a single question by id', async () => {
    const question = makeQuestion();
    await repo.save(question);
    await repo.delete(question.id);
    const result = await repo.findById(question.id);
    expect(result.isFailure).toBe(true);
  });

  it('should save updated question (upsert)', async () => {
    const question = makeQuestion();
    await repo.save(question);
    question.update({ label: 'Updated label' });
    await repo.save(question);
    const result = await repo.findById(question.id);
    expect(result.value.label).toBe('Updated label');
  });
});
