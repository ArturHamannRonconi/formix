import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoResponseEmailRepository } from './mongo-response-email.repository';
import { ResponseEmailSchemaClass, ResponseEmailSchema } from '../schemas/response-email.schema';
import { ResponseEmailAggregate } from '@modules/responses/domain/aggregate/response-email.aggregate';

describe('MongoResponseEmailRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoResponseEmailRepository;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: ResponseEmailSchemaClass.name, schema: ResponseEmailSchema },
        ]),
      ],
      providers: [MongoResponseEmailRepository],
    }).compile();

    repo = module.get(MongoResponseEmailRepository);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should save and existsByFormIdAndEmailHash returns true', async () => {
    const re = ResponseEmailAggregate.create('form-123', 'hash-abc');
    await repo.save(re);
    const exists = await repo.existsByFormIdAndEmailHash('form-123', 'hash-abc');
    expect(exists).toBe(true);
  });

  it('should return false when not found', async () => {
    const exists = await repo.existsByFormIdAndEmailHash('form-notexist', 'hash-xyz');
    expect(exists).toBe(false);
  });

  it('should deleteByFormId', async () => {
    const formId = 'form-delete-email';
    await repo.save(ResponseEmailAggregate.create(formId, 'hash-1'));
    await repo.save(ResponseEmailAggregate.create(formId, 'hash-2'));
    await repo.deleteByFormId(formId);
    const exists = await repo.existsByFormIdAndEmailHash(formId, 'hash-1');
    expect(exists).toBe(false);
  });

  it('should not expose any data — existsByFormIdAndEmailHash returns only boolean', async () => {
    const result = await repo.existsByFormIdAndEmailHash('some-form', 'some-hash');
    expect(typeof result).toBe('boolean');
  });
});
