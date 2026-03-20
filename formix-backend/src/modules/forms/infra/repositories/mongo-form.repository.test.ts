import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoFormRepository } from './mongo-form.repository';
import { FormMapper } from './form.mapper';
import { FormSchemaClass, FormSchema } from '../schemas/form.schema';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';

describe('MongoFormRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoFormRepository;

  const makeForm = (overrides: Partial<{ organizationId: string; title: string }> = {}) =>
    FormAggregate.create({
      organizationId: overrides.organizationId ?? 'org-123',
      createdBy: 'user-123',
      title: overrides.title ?? 'Test Form',
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: FormSchemaClass.name, schema: FormSchema }]),
      ],
      providers: [FormMapper, MongoFormRepository],
    }).compile();

    repo = module.get(MongoFormRepository);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should save and findById', async () => {
    const form = makeForm();
    await repo.save(form);
    const result = await repo.findById(form.id);
    expect(result.isFailure).toBe(false);
    expect(result.value.id.getValue()).toBe(form.id.getValue());
    expect(result.value.title).toBe(form.title);
    expect(result.value.status.isDraft()).toBe(true);
  });

  it('should return failure when findById not found', async () => {
    const result = await repo.findById(FormId.create());
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Form not found');
  });

  it('should findByOrganizationId filtering correctly', async () => {
    const form1 = makeForm({ organizationId: 'org-filter-test' });
    const form2 = makeForm({ organizationId: 'org-filter-test' });
    const formOther = makeForm({ organizationId: 'org-other' });
    await repo.save(form1);
    await repo.save(form2);
    await repo.save(formOther);

    const results = await repo.findByOrganizationId('org-filter-test');
    expect(results.length).toBeGreaterThanOrEqual(2);
    results.forEach(f => expect(f.organizationId).toBe('org-filter-test'));
  });

  it('should findByOrganizationId with status filter', async () => {
    const draft = makeForm({ organizationId: 'org-status-test' });
    const active = makeForm({ organizationId: 'org-status-test' });
    active.publish(PublicToken.generate());
    await repo.save(draft);
    await repo.save(active);

    const drafts = await repo.findByOrganizationId('org-status-test', 'draft');
    expect(drafts.every(f => f.status.isDraft())).toBe(true);

    const actives = await repo.findByOrganizationId('org-status-test', 'active');
    expect(actives.every(f => f.status.isActive())).toBe(true);
  });

  it('should findByPublicToken', async () => {
    const form = makeForm({ organizationId: 'org-token-test' });
    const token = PublicToken.generate();
    form.publish(token);
    await repo.save(form);

    const result = await repo.findByPublicToken(token.getValue());
    expect(result.isFailure).toBe(false);
    expect(result.value.publicToken?.getValue()).toBe(token.getValue());
  });

  it('should return failure when findByPublicToken not found', async () => {
    const result = await repo.findByPublicToken('nonexistent-token');
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toBe('Form not found');
  });

  it('should save updated form (upsert)', async () => {
    const form = makeForm();
    await repo.save(form);
    form.update({ title: 'Updated Title' });
    await repo.save(form);
    const result = await repo.findById(form.id);
    expect(result.value.title).toBe('Updated Title');
  });

  it('should delete a form', async () => {
    const form = makeForm();
    await repo.save(form);
    await repo.delete(form.id);
    const result = await repo.findById(form.id);
    expect(result.isFailure).toBe(true);
  });
});
