import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongooseModule as MongooseRootModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { MongoOrganizationRepository } from './mongo-organization.repository';
import {
  OrganizationSchemaClass,
  OrganizationSchema,
  OrganizationDocument,
} from '../schemas/organization.schema';
import { Organization } from '@modules/organizations/domain/aggregate/entities/organization.entity';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';

describe('MongoOrganizationRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongoOrganizationRepository;
  let orgModel: Model<OrganizationDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseRootModule.forRoot(uri),
        MongooseModule.forFeature([{ name: OrganizationSchemaClass.name, schema: OrganizationSchema }]),
      ],
      providers: [MongoOrganizationRepository],
    }).compile();

    repository = module.get<MongoOrganizationRepository>(MongoOrganizationRepository);
    orgModel = module.get<Model<OrganizationDocument>>(getModelToken(OrganizationSchemaClass.name));
  });

  afterAll(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await orgModel.deleteMany({});
  });

  function createTestOrg(name = 'Test Org', slugStr = 'test-org'): Organization {
    return Organization.create(name, Slug.create(slugStr));
  }

  describe('save()', () => {
    it('should save a new organization', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const doc = await orgModel.findOne({ _id: org.id });
      expect(doc).not.toBeNull();
      expect(doc!.name).toBe('Test Org');
      expect(doc!.slug).toBe('test-org');
    });

    it('should update an existing organization', async () => {
      const org = createTestOrg();
      await repository.save(org);

      org.updateName('Updated Org', Slug.create('updated-org'));
      await repository.save(org);

      const doc = await orgModel.findOne({ _id: org.id });
      expect(doc!.name).toBe('Updated Org');
      expect(doc!.slug).toBe('updated-org');
    });
  });

  describe('findById()', () => {
    it('should find an organization by id', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const found = await repository.findById(org.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Test Org');
    });

    it('should return null if organization not found', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findBySlug()', () => {
    it('should find an organization by slug', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const found = await repository.findBySlug('test-org');
      expect(found).not.toBeNull();
      expect(found!.id).toBe(org.id);
    });

    it('should return null if slug not found', async () => {
      const found = await repository.findBySlug('not-found');
      expect(found).toBeNull();
    });
  });

  describe('existsBySlug()', () => {
    it('should return true if slug exists', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const result = await repository.existsBySlug('test-org');
      expect(result).toBe(true);
    });

    it('should return false if slug does not exist', async () => {
      const result = await repository.existsBySlug('not-found');
      expect(result).toBe(false);
    });
  });
});
