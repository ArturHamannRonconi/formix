import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule as MongooseRootModule } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MongoUserRepository } from './mongo-user.repository';
import { UserSchemaClass, UserSchema, UserDocument } from '../schemas/user.schema';
import { User } from '@modules/users/domain/aggregate/entities/user.entity';
import { Email } from '@shared/value-objects/email.vo';
import { Password } from '@shared/value-objects/password.vo';

describe('MongoUserRepository (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repository: MongoUserRepository;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseRootModule.forRoot(uri),
        MongooseModule.forFeature([{ name: UserSchemaClass.name, schema: UserSchema }]),
      ],
      providers: [MongoUserRepository],
    }).compile();

    repository = module.get<MongoUserRepository>(MongoUserRepository);
    userModel = module.get<Model<UserDocument>>(getModelToken(UserSchemaClass.name));
  });

  afterAll(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  async function createTestUser(emailStr = 'test@example.com'): Promise<User> {
    const email = Email.create(emailStr);
    const password = await Password.create('SecurePass1');
    return User.create({ name: 'Test User', email, passwordHash: password });
  }

  describe('save()', () => {
    it('should save a new user', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const doc = await userModel.findById(user.id);
      expect(doc).not.toBeNull();
      expect(doc!.email).toBe('test@example.com');
    });

    it('should update an existing user', async () => {
      const user = await createTestUser();
      await repository.save(user);

      user.updateName('Updated Name');
      await repository.save(user);

      const doc = await userModel.findById(user.id);
      expect(doc!.name).toBe('Updated Name');
    });
  });

  describe('findById()', () => {
    it('should find a user by id', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const found = await repository.findById(user.id);
      expect(found).not.toBeNull();
      expect(found!.email.getValue()).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      const found = await repository.findById('non-existent-uuid');
      expect(found).toBeNull();
    });
  });

  describe('findByEmail()', () => {
    it('should find a user by email', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const found = await repository.findByEmail('test@example.com');
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Test User');
    });

    it('should return null if email not found', async () => {
      const found = await repository.findByEmail('notfound@example.com');
      expect(found).toBeNull();
    });
  });

  describe('exists()', () => {
    it('should return true if email exists', async () => {
      const user = await createTestUser();
      await repository.save(user);

      const result = await repository.exists('test@example.com');
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const result = await repository.exists('notfound@example.com');
      expect(result).toBe(false);
    });
  });
});
