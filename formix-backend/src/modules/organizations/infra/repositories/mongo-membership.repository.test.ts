import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongooseModule as MongooseRootModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { MongoMembershipRepository } from './mongo-membership.repository';
import { MembershipSchemaClass, MembershipSchema, MembershipDocument } from '../schemas/membership.schema';
import { Membership } from '@modules/organizations/domain/aggregate/entities/membership.entity';
import { MemberRole } from '@modules/organizations/domain/aggregate/value-objects/member-role.enum';

describe('MongoMembershipRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongoMembershipRepository;
  let membershipModel: Model<MembershipDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseRootModule.forRoot(uri),
        MongooseModule.forFeature([{ name: MembershipSchemaClass.name, schema: MembershipSchema }]),
      ],
      providers: [MongoMembershipRepository],
    }).compile();

    repository = module.get<MongoMembershipRepository>(MongoMembershipRepository);
    membershipModel = module.get<Model<MembershipDocument>>(
      getModelToken(MembershipSchemaClass.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await membershipModel.deleteMany({});
  });

  function createTestMembership(
    userId = 'user-1',
    organizationId = 'org-1',
    role = MemberRole.MEMBER,
  ): Membership {
    return Membership.create({ userId, organizationId, role });
  }

  describe('save()', () => {
    it('should save a new membership', async () => {
      const membership = createTestMembership();
      await repository.save(membership);

      const doc = await membershipModel.findOne({ _id: membership.id });
      expect(doc).not.toBeNull();
      expect(doc!.userId).toBe('user-1');
      expect(doc!.organizationId).toBe('org-1');
      expect(doc!.role).toBe(MemberRole.MEMBER);
    });
  });

  describe('findByUserAndOrg()', () => {
    it('should find a membership by userId and organizationId', async () => {
      const membership = createTestMembership('user-2', 'org-2', MemberRole.ADMIN);
      await repository.save(membership);

      const found = await repository.findByUserAndOrg('user-2', 'org-2');
      expect(found).not.toBeNull();
      expect(found!.isAdmin()).toBe(true);
    });

    it('should return null if not found', async () => {
      const found = await repository.findByUserAndOrg('no-user', 'no-org');
      expect(found).toBeNull();
    });
  });

  describe('findByOrganizationId()', () => {
    it('should find all memberships for an organization', async () => {
      await repository.save(createTestMembership('user-1', 'org-3', MemberRole.ADMIN));
      await repository.save(createTestMembership('user-2', 'org-3', MemberRole.MEMBER));
      await repository.save(createTestMembership('user-3', 'org-4', MemberRole.MEMBER));

      const results = await repository.findByOrganizationId('org-3');
      expect(results).toHaveLength(2);
    });
  });

  describe('delete()', () => {
    it('should delete a membership by id', async () => {
      const membership = createTestMembership();
      await repository.save(membership);

      await repository.delete(membership.id);

      const doc = await membershipModel.findOne({ _id: membership.id });
      expect(doc).toBeNull();
    });
  });

  describe('countAdminsByOrganization()', () => {
    it('should count admins correctly', async () => {
      await repository.save(createTestMembership('user-1', 'org-5', MemberRole.ADMIN));
      await repository.save(createTestMembership('user-2', 'org-5', MemberRole.ADMIN));
      await repository.save(createTestMembership('user-3', 'org-5', MemberRole.MEMBER));

      const count = await repository.countAdminsByOrganization('org-5');
      expect(count).toBe(2);
    });

    it('should return 0 if no admins', async () => {
      const count = await repository.countAdminsByOrganization('empty-org');
      expect(count).toBe(0);
    });
  });
});
