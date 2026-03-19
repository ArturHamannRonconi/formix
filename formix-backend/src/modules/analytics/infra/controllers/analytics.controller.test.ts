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
import { AnalyticsController } from './analytics.controller';
import { GetFormAnalyticsUseCase } from '@modules/analytics/domain/usecases/get-form-analytics.usecase';
import { MongoResponseRepository } from '@modules/responses/infra/repositories/mongo-response.repository';
import { MongoFormRepository } from '@modules/forms/infra/repositories/mongo-form.repository';
import { MongoQuestionRepository } from '@modules/forms/infra/repositories/mongo-question.repository';
import { RESPONSE_REPOSITORY } from '@modules/responses/domain/repositories/response.repository';
import { FORM_REPOSITORY, IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { QUESTION_REPOSITORY } from '@modules/forms/domain/repositories/question.repository';
import { ResponseSchemaClass, ResponseSchema } from '@modules/responses/infra/schemas/response.schema';
import { FormSchemaClass, FormSchema } from '@modules/forms/infra/schemas/form.schema';
import { QuestionSchemaClass, QuestionSchema } from '@modules/forms/infra/schemas/question.schema';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';
import { JwtAuthGuard } from '@modules/auth/infra/guards/jwt-auth.guard';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';

const TEST_SECRET = 'default-secret';

describe('AnalyticsController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
  let formRepo: IFormRepository;
  const organizationId = 'org-analytics-test';
  const userId = 'user-analytics-test';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: ResponseSchemaClass.name, schema: ResponseSchema },
          { name: FormSchemaClass.name, schema: FormSchema },
          { name: QuestionSchemaClass.name, schema: QuestionSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [AnalyticsController],
      providers: [
        GetFormAnalyticsUseCase,
        { provide: RESPONSE_REPOSITORY, useClass: MongoResponseRepository },
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

  describe('GET /forms/:id/analytics', () => {
    it('should return 200 with analytics for a valid form', async () => {
      const form = FormAggregate.create({ organizationId, createdBy: userId, title: 'Analytics Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const formId = form.id.getValue();

      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}/analytics`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.formId).toBe(formId);
      expect(res.body.totalResponses).toBe(0);
      expect(res.body.responsesOverTime).toBeDefined();
      expect(res.body.questionMetrics).toBeDefined();
    });

    it('should support groupBy query param', async () => {
      const form = FormAggregate.create({ organizationId, createdBy: userId, title: 'GroupBy Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const formId = form.id.getValue();

      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}/analytics?groupBy=week`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/forms/some-id/analytics');
      expect(res.status).toBe(401);
    });

    it('should return 404 for unknown formId', async () => {
      const res = await request(app.getHttpServer())
        .get('/forms/unknown-form-id/analytics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 403 for form belonging to another org', async () => {
      const form = FormAggregate.create({ organizationId: 'other-org', createdBy: userId, title: 'Other Org Form' });
      form.publish(PublicToken.generate());
      await formRepo.save(form);
      const formId = form.id.getValue();

      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}/analytics`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
