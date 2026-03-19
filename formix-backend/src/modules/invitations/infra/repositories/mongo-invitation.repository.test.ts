import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoInvitationRepository } from './mongo-invitation.repository';
import { InvitationSchemaClass, InvitationSchema } from '../schemas/invitation.schema';
import { Invitation } from '@modules/invitations/domain/aggregate/invitation.aggregate';
import { InvitationId } from '@modules/invitations/domain/aggregate/value-objects/invitation-id.vo';

describe('MongoInvitationRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoInvitationRepository;

  const makeInvitation = () =>
    Invitation.create({
      organizationId: 'org-123',
      email: 'user@example.com',
      role: 'member',
      expiresInMs: 604800000,
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([{ name: InvitationSchemaClass.name, schema: InvitationSchema }]),
      ],
      providers: [MongoInvitationRepository],
    }).compile();

    repo = module.get(MongoInvitationRepository);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('should save and findById', async () => {
    const inv = makeInvitation();
    await repo.save(inv);
    const result = await repo.findById(inv.id);
    expect(result.isFailure).toBe(false);
    expect(result.value.id.getValue()).toBe(inv.id.getValue());
    expect(result.value.email).toBe(inv.email);
  });

  it('should return failure when findById not found', async () => {
    const result = await repo.findById(InvitationId.create());
    expect(result.isFailure).toBe(true);
  });

  it('should findByTokenHash', async () => {
    const inv = makeInvitation();
    await repo.save(inv);
    const result = await repo.findByTokenHash(inv.tokenHash);
    expect(result.isFailure).toBe(false);
    expect(result.value.tokenHash).toBe(inv.tokenHash);
  });

  it('should return failure when findByTokenHash not found', async () => {
    const result = await repo.findByTokenHash('nonexistent-hash');
    expect(result.isFailure).toBe(true);
  });

  it('should findPendingByEmailAndOrg', async () => {
    const inv = Invitation.create({
      organizationId: 'org-pending-test',
      email: 'pending@example.com',
      expiresInMs: 604800000,
    });
    await repo.save(inv);
    const found = await repo.findPendingByEmailAndOrg('pending@example.com', 'org-pending-test');
    expect(found).not.toBeNull();
    expect(found!.email).toBe('pending@example.com');
  });

  it('should return null if no pending invitation found', async () => {
    const found = await repo.findPendingByEmailAndOrg('notfound@example.com', 'org-123');
    expect(found).toBeNull();
  });

  it('should findByOrganizationId', async () => {
    const inv = Invitation.create({
      organizationId: 'org-list-test',
      email: 'list@example.com',
      expiresInMs: 604800000,
    });
    await repo.save(inv);
    const list = await repo.findByOrganizationId('org-list-test');
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].organizationId).toBe('org-list-test');
  });

  it('should save updated invitation (upsert)', async () => {
    const inv = makeInvitation();
    await repo.save(inv);
    inv.accept();
    await repo.save(inv);
    const result = await repo.findById(inv.id);
    expect(result.value.status.isAccepted()).toBe(true);
  });

  it('should delete an invitation', async () => {
    const inv = makeInvitation();
    await repo.save(inv);
    await repo.delete(inv.id);
    const result = await repo.findById(inv.id);
    expect(result.isFailure).toBe(true);
  });
});
