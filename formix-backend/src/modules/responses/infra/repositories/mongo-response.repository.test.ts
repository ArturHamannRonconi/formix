import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoResponseRepository } from './mongo-response.repository';
import { ResponseSchemaClass, ResponseSchema } from '../schemas/response.schema';
import { ResponseAggregate } from '@modules/responses/domain/aggregate/response.aggregate';

describe('MongoResponseRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoResponseRepository;

  const makeResponse = (formId = 'form-123', orgId = 'org-123') =>
    ResponseAggregate.create({
      formId,
      organizationId: orgId,
      answers: [{ questionId: 'q-1', value: 'hello' }],
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: ResponseSchemaClass.name, schema: ResponseSchema }]),
      ],
      providers: [MongoResponseRepository],
    }).compile();

    repo = module.get(MongoResponseRepository);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should save and findByFormId', async () => {
    const r = makeResponse('form-save-test');
    await repo.save(r);
    const results = await repo.findByFormId('form-save-test');
    expect(results).toHaveLength(1);
    expect(results[0].id.getValue()).toBe(r.id.getValue());
    expect(results[0].answers[0].value).toBe('hello');
  });

  it('should findByFormId with pagination', async () => {
    const formId = 'form-paginate';
    await repo.save(makeResponse(formId));
    await repo.save(makeResponse(formId));
    await repo.save(makeResponse(formId));

    const page1 = await repo.findByFormId(formId, { limit: 2, offset: 0 });
    const page2 = await repo.findByFormId(formId, { limit: 2, offset: 2 });

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(1);
  });

  it('should countByFormId', async () => {
    const formId = 'form-count';
    await repo.save(makeResponse(formId));
    await repo.save(makeResponse(formId));
    const count = await repo.countByFormId(formId);
    expect(count).toBe(2);
  });

  it('should deleteByFormId', async () => {
    const formId = 'form-delete';
    await repo.save(makeResponse(formId));
    await repo.save(makeResponse(formId));
    await repo.deleteByFormId(formId);
    const count = await repo.countByFormId(formId);
    expect(count).toBe(0);
  });
});
