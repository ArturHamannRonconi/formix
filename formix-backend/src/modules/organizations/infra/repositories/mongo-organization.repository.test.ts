import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongooseModule as MongooseRootModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { MongoOrganizationRepository } from './mongo-organization.repository';
import { OrganizationSchemaClass, OrganizationSchema, OrganizationDocument } from '../schemas/organization.schema';
import { Organization } from '@modules/organizations/domain/aggregate/organization.aggregate';
import { OrganizationId } from '@modules/organizations/domain/aggregate/value-objects/organization-id.vo';
import { UserId } from '@modules/users/domain/aggregate/value-objects/user-id.vo';
import { Slug } from '@modules/organizations/domain/aggregate/value-objects/slug.vo';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';

describe('MongoOrganizationRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongoOrganizationRepository;
  let orgModel: Model<OrganizationDocument>;

  const adminId = UserId.from('admin-user-id');

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

  function createTestOrg(name = 'Acme Corp'): Organization {
    return Organization.create({ name, slug: Slug.fromName(name), initialAdminId: adminId });
  }

  describe('save()', () => {
    it('should persist a new organization with members', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const doc = await orgModel.findById(org.id.getValue());
      expect(doc).not.toBeNull();
      expect(doc!.name).toBe('Acme Corp');
      expect(doc!.members).toHaveLength(1);
      expect(doc!.members[0].userId).toBe('admin-user-id');
    });

    it('should update an existing organization', async () => {
      const org = createTestOrg();
      await repository.save(org);

      org.updateName('Updated Corp', Slug.fromName('Updated Corp'));
      await repository.save(org);

      const doc = await orgModel.findById(org.id.getValue());
      expect(doc!.name).toBe('Updated Corp');
    });
  });

  describe('findById()', () => {
    it('should find an organization by id', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const result = await repository.findById(org.id);
      expect(result.isFailure).toBe(false);
      expect(result.value.name).toBe('Acme Corp');
      expect(result.value.members).toHaveLength(1);
    });

    it('should return failure when not found', async () => {
      const result = await repository.findById(OrganizationId.from('nonexistent-id'));
      expect(result.isFailure).toBe(true);
    });
  });

  describe('findBySlug()', () => {
    it('should find an organization by slug', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const result = await repository.findBySlug(Slug.fromName('Acme Corp'));
      expect(result.isFailure).toBe(false);
      expect(result.value.name).toBe('Acme Corp');
    });

    it('should return failure when not found', async () => {
      const result = await repository.findBySlug(Slug.create('not-found'));
      expect(result.isFailure).toBe(true);
    });
  });

  describe('findByMemberId()', () => {
    it('should find organizations where user is a member', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const results = await repository.findByMemberId(adminId);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Acme Corp');
    });

    it('should return empty array when user has no memberships', async () => {
      const results = await repository.findByMemberId(UserId.from('unknown-user'));
      expect(results).toHaveLength(0);
    });
  });

  describe('existsBySlug()', () => {
    it('should return true if slug exists', async () => {
      const org = createTestOrg();
      await repository.save(org);

      const result = await repository.existsBySlug(Slug.fromName('Acme Corp'));
      expect(result).toBe(true);
    });

    it('should return false if slug does not exist', async () => {
      const result = await repository.existsBySlug(Slug.create('not-found'));
      expect(result).toBe(false);
    });
  });
});
