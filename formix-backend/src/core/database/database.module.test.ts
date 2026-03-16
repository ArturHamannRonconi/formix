import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { DatabaseModule } from './database.module';
import { ConfigModule } from '@nestjs/config';

describe('DatabaseModule (integration)', () => {
  let mongod: MongoMemoryServer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    process.env.PORT = '3001';
    process.env.NODE_ENV = 'test';

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
    await mongod.stop();
  });

  it('should connect to MongoDB', async () => {
    const connection = moduleRef.get<Connection>(getConnectionToken());
    expect(connection.readyState).toBe(1); // 1 = connected
  });
});
