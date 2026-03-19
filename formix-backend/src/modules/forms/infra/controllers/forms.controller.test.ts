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
import { FormsController } from './forms.controller';
import { CreateFormUseCase } from '@modules/forms/domain/usecases/create-form.usecase';
import { ListFormsUseCase } from '@modules/forms/domain/usecases/list-forms.usecase';
import { GetFormUseCase } from '@modules/forms/domain/usecases/get-form.usecase';
import { UpdateFormUseCase } from '@modules/forms/domain/usecases/update-form.usecase';
import { DeleteFormUseCase } from '@modules/forms/domain/usecases/delete-form.usecase';
import { AddQuestionUseCase } from '@modules/forms/domain/usecases/add-question.usecase';
import { UpdateQuestionUseCase } from '@modules/forms/domain/usecases/update-question.usecase';
import { RemoveQuestionUseCase } from '@modules/forms/domain/usecases/remove-question.usecase';
import { ReorderQuestionsUseCase } from '@modules/forms/domain/usecases/reorder-questions.usecase';
import { MongoFormRepository } from '../repositories/mongo-form.repository';
import { MongoQuestionRepository } from '../repositories/mongo-question.repository';
import { FORM_REPOSITORY } from '@modules/forms/domain/repositories/form.repository';
import { QUESTION_REPOSITORY } from '@modules/forms/domain/repositories/question.repository';
import { FormSchemaClass, FormSchema } from '../schemas/form.schema';
import { QuestionSchemaClass, QuestionSchema } from '../schemas/question.schema';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';
import { JwtAuthGuard } from '@modules/auth/infra/guards/jwt-auth.guard';

const TEST_SECRET = 'default-secret';

describe('FormsController (integration)', () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;
  let jwtService: JwtService;
  let userToken: string;
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
          { name: FormSchemaClass.name, schema: FormSchema },
          { name: QuestionSchemaClass.name, schema: QuestionSchema },
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_SECRET, signOptions: { expiresIn: '15m' } }),
      ],
      controllers: [FormsController],
      providers: [
        CreateFormUseCase,
        ListFormsUseCase,
        GetFormUseCase,
        UpdateFormUseCase,
        DeleteFormUseCase,
        AddQuestionUseCase,
        UpdateQuestionUseCase,
        RemoveQuestionUseCase,
        ReorderQuestionsUseCase,
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
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('POST /forms', () => {
    it('should create form (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Form', description: 'A test form' });

      expect(res.status).toBe(201);
      expect(res.body.formId).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .send({ title: 'Test Form' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /forms', () => {
    it('should list forms for org (200)', async () => {
      await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'List Test Form' });

      const res = await request(app.getHttpServer())
        .get('/forms')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.forms)).toBe(true);
      expect(res.body.forms.length).toBeGreaterThan(0);
    });

    it('should filter by status (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/forms?status=draft')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.forms)).toBe(true);
      res.body.forms.forEach((f: { status: string }) => {
        expect(f.status).toBe('draft');
      });
    });

    it('should not return forms from another org', async () => {
      const otherOrgToken = jwtService.sign({ sub: 'other-user', organizationId: 'other-org', role: 'admin' });

      const res = await request(app.getHttpServer())
        .get('/forms')
        .set('Authorization', `Bearer ${otherOrgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.forms).toHaveLength(0);
    });
  });

  describe('GET /forms/:id', () => {
    it('should return form with questions (200)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form With Questions' });

      const formId = createRes.body.formId;

      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.form.id).toBe(formId);
      expect(Array.isArray(res.body.questions)).toBe(true);
    });

    it('should return 404 for non-existent form (404)', async () => {
      const res = await request(app.getHttpServer())
        .get('/forms/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /forms/:id', () => {
    it('should update form (200)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Original Title' });

      const formId = createRes.body.formId;

      const res = await request(app.getHttpServer())
        .patch(`/forms/${formId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(true);

      const getRes = await request(app.getHttpServer())
        .get(`/forms/${formId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.body.form.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent form', async () => {
      const res = await request(app.getHttpServer())
        .patch('/forms/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /forms/:id', () => {
    it('should delete form (200)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form To Delete' });

      const formId = createRes.body.formId;

      const res = await request(app.getHttpServer())
        .delete(`/forms/${formId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(true);

      const getRes = await request(app.getHttpServer())
        .get(`/forms/${formId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent form', async () => {
      const res = await request(app.getHttpServer())
        .delete('/forms/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /forms/:formId/questions', () => {
    it('should create question (201)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form With Questions' });

      const formId = createRes.body.formId;

      const res = await request(app.getHttpServer())
        .post(`/forms/${formId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'text', label: 'Your name', required: false });

      expect(res.status).toBe(201);
      expect(res.body.questionId).toBeDefined();
    });

    it('should return 400 for radio type without options', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form for Radio Test' });

      const formId = createRes.body.formId;

      const res = await request(app.getHttpServer())
        .post(`/forms/${formId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'radio', label: 'Pick one', required: true });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /forms/:formId/questions/:questionId', () => {
    it('should update question (200)', async () => {
      const createFormRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form for Update Question' });

      const formId = createFormRes.body.formId;

      const createQRes = await request(app.getHttpServer())
        .post(`/forms/${formId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'text', label: 'Old label', required: false });

      const questionId = createQRes.body.questionId;

      const res = await request(app.getHttpServer())
        .patch(`/forms/${formId}/questions/${questionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ label: 'New label' });

      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(true);
    });
  });

  describe('DELETE /forms/:formId/questions/:questionId', () => {
    it('should remove question (200)', async () => {
      const createFormRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form for Remove Question' });

      const formId = createFormRes.body.formId;

      const createQRes = await request(app.getHttpServer())
        .post(`/forms/${formId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'text', label: 'Question to delete', required: false });

      const questionId = createQRes.body.questionId;

      const res = await request(app.getHttpServer())
        .delete(`/forms/${formId}/questions/${questionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.removed).toBe(true);
    });
  });

  describe('PATCH /forms/:formId/questions/reorder', () => {
    it('should reorder questions (200)', async () => {
      const createFormRes = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Form for Reorder' });

      const formId = createFormRes.body.formId;

      const q1Res = await request(app.getHttpServer())
        .post(`/forms/${formId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'text', label: 'Question 1', required: false });

      const q2Res = await request(app.getHttpServer())
        .post(`/forms/${formId}/questions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'text', label: 'Question 2', required: false });

      const res = await request(app.getHttpServer())
        .patch(`/forms/${formId}/questions/reorder`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          questions: [
            { id: q1Res.body.questionId, order: 1 },
            { id: q2Res.body.questionId, order: 0 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.reordered).toBe(true);
    });
  });
});
