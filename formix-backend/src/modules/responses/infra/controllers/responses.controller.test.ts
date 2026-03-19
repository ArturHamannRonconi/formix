import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import mongoose from 'mongoose';
import * as request from 'supertest';
import { ResponsesController } from './responses.controller';
import { SubmitResponseUseCase } from '@modules/responses/domain/usecases/submit-response.usecase';
import { ListResponsesUseCase } from '@modules/responses/domain/usecases/list-responses.usecase';
import { MongoResponseRepository } from '../repositories/mongo-response.repository';
import { MongoResponseEmailRepository } from '../repositories/mongo-response-email.repository';
import { MongoFormRepository } from '@modules/forms/infra/repositories/mongo-form.repository';
import { MongoQuestionRepository } from '@modules/forms/infra/repositories/mongo-question.repository';
import { RESPONSE_REPOSITORY } from '@modules/responses/domain/repositories/response.repository';
import { RESPONSE_EMAIL_REPOSITORY } from '@modules/responses/domain/repositories/response-email.repository';
import { FORM_REPOSITORY, IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { QUESTION_REPOSITORY } from '@modules/forms/domain/repositories/question.repository';
import { ResponseSchemaClass, ResponseSchema } from '../schemas/response.schema';
import { ResponseEmailSchemaClass, ResponseEmailSchema } from '../schemas/response-email.schema';
import { FormSchemaClass, FormSchema } from '@modules/forms/infra/schemas/form.schema';
import { QuestionSchemaClass, QuestionSchema } from '@modules/forms/infra/schemas/question.schema';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';
import { JwtAuthGuard } from '@modules/auth/infra/guards/jwt-auth.guard';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';

const TEST_SECRET = 'default-secret';

describe('ResponsesController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let formRepo: IFormRepository;
  const organizationId = 'org-test-123';
  const userId = 'user-test-456';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: ResponseSchemaClass.name, schema: ResponseSchema },
          { name: ResponseEmailSchemaClass.name, schema: ResponseEmailSchema },
          { name: FormSchemaClass.name, schema: FormSchema },
          { name: QuestionSchemaClass.name, schema: QuestionSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [ResponsesController],
      providers: [
        SubmitResponseUseCase,
        ListResponsesUseCase,
        { provide: RESPONSE_REPOSITORY, useClass: MongoResponseRepository },
        { provide: RESPONSE_EMAIL_REPOSITORY, useClass: MongoResponseEmailRepository },
        { provide: FORM_REPOSITORY, useClass: MongoFormRepository },
        { provide: QUESTION_REPOSITORY, useClass: MongoQuestionRepository },
        JwtStrategy,
        JwtAuthGuard,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();

    app = testModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = testModule.get(JwtService);
    userToken = jwtService.sign({ sub: userId, organizationId, role: 'admin' });
    formRepo = testModule.get(FORM_REPOSITORY);
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('POST /responses/:publicToken', () => {
    it('should return 201 for valid submission', async () => {
      // Create and publish a form
      const form = FormAggregate.create({ organizationId, createdBy: userId, title: 'Public Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const token = form.publicToken!.getValue();

      const res = await request(app.getHttpServer())
        .post(`/responses/${token}`)
        .send({ email: 'test@example.com', answers: [] });

      expect(res.status).toBe(201);
      expect(res.body.submitted).toBe(true);
    });

    it('should return 404 for unknown publicToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/responses/unknown-token-xyz')
        .send({ email: 'test@example.com', answers: [] });

      expect(res.status).toBe(404);
    });

    it('should return 409 on duplicate submission', async () => {
      const form = FormAggregate.create({ organizationId, createdBy: userId, title: 'No Dup Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const token = form.publicToken!.getValue();

      await request(app.getHttpServer())
        .post(`/responses/${token}`)
        .send({ email: 'dup@example.com', answers: [] });

      const res = await request(app.getHttpServer())
        .post(`/responses/${token}`)
        .send({ email: 'dup@example.com', answers: [] });

      expect(res.status).toBe(409);
    });

    it('should not require authentication (public route)', async () => {
      const form = FormAggregate.create({ organizationId, createdBy: userId, title: 'Public No Auth' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const token = form.publicToken!.getValue();

      const res = await request(app.getHttpServer())
        .post(`/responses/${token}`)
        .send({ email: 'noauth@example.com', answers: [] });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /forms/:id/responses', () => {
    it('should return paginated responses (200)', async () => {
      const form = FormAggregate.create({ organizationId, createdBy: userId, title: 'Responses Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const formId = form.id.getValue();
      const token = form.publicToken!.getValue();

      // Submit a response first
      await request(app.getHttpServer())
        .post(`/responses/${token}`)
        .send({ email: 'view@example.com', answers: [] });

      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}/responses`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.responses).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.offset).toBe(0);
      expect(res.body.limit).toBe(20);
    });

    it('should return 404 for unknown formId', async () => {
      const res = await request(app.getHttpServer())
        .get('/forms/unknown-form-id/responses')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/forms/some-id/responses');
      expect(res.status).toBe(401);
    });

    it('should return 403 for form belonging to another org', async () => {
      const form = FormAggregate.create({ organizationId: 'other-org', createdBy: userId, title: 'Other Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const formId = form.id.getValue();

      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}/responses`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
