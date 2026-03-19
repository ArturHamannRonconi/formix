import { GetFormAnalyticsUseCase } from './get-form-analytics.usecase';
import { IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { IQuestionRepository } from '@modules/forms/domain/repositories/question.repository';
import { IResponseRepository } from '@modules/responses/domain/repositories/response.repository';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { FormStatus } from '@modules/forms/domain/aggregate/value-objects/form-status.vo';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';
import { QuestionEntity } from '@modules/forms/domain/aggregate/question.entity';
import { QuestionId } from '@modules/forms/domain/aggregate/value-objects/question-id.vo';
import { QuestionType } from '@modules/forms/domain/aggregate/value-objects/question-type.vo';
import { ResponseAggregate } from '@modules/responses/domain/aggregate/response.aggregate';
import { Output } from '@shared/output';

describe('GetFormAnalyticsUseCase', () => {
  let useCase: GetFormAnalyticsUseCase;
  let formRepo: jest.Mocked<IFormRepository>;
  let questionRepo: jest.Mocked<IQuestionRepository>;
  let responseRepo: jest.Mocked<IResponseRepository>;

  const organizationId = 'org-123';

  const makeForm = (orgId = organizationId) =>
    FormAggregate.reconstitute({
      id: FormId.create(),
      organizationId: orgId,
      createdBy: 'user-1',
      title: 'Test Form',
      publicToken: PublicToken.from('token-xyz'),
      settings: { allowMultipleResponses: false, allowedEmailDomains: [] },
      status: FormStatus.active(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const makeQuestion = (formId: string, type: string, options?: string[]) =>
    QuestionEntity.reconstitute({
      id: QuestionId.create(),
      formId,
      organizationId,
      type: QuestionType.from(type),
      label: `Question (${type})`,
      required: false,
      order: 1,
      options,
      createdAt: new Date(),
    });

  const makeResponse = (formId: string, answers: { questionId: string; value: unknown }[]) =>
    ResponseAggregate.reconstitute({
      id: { getValue: () => 'resp-id', create: () => {}, from: () => {} } as any,
      formId,
      organizationId,
      answers,
      submittedAt: new Date('2024-01-15'),
    });

  beforeEach(() => {
    formRepo = {
      findById: jest.fn(),
      findByPublicToken: jest.fn(),
      findByOrganizationId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    questionRepo = {
      findByFormId: jest.fn(),
      findByFormIdOrdered: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      countByFormId: jest.fn(),
      delete: jest.fn(),
      deleteByFormId: jest.fn(),
    };
    responseRepo = {
      save: jest.fn(),
      findByFormId: jest.fn(),
      findAllByFormId: jest.fn(),
      countByFormId: jest.fn(),
      deleteByFormId: jest.fn(),
    };

    useCase = new GetFormAnalyticsUseCase(formRepo, questionRepo, responseRepo);
  });

  it('should return 403 if form belongs to another org', async () => {
    const form = makeForm('other-org');
    formRepo.findById.mockResolvedValue(Output.ok(form));

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('Forbidden');
  });

  it('should return 404 if form not found', async () => {
    formRepo.findById.mockResolvedValue(Output.fail('Form not found'));

    const result = await useCase.execute({ organizationId, formId: 'unknown-id' });

    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('not found');
  });

  it('should return totalResponses correctly', async () => {
    const form = makeForm();
    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), []),
      makeResponse(form.id.getValue(), []),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    expect(result.isFailure).toBe(false);
    expect(result.value.totalResponses).toBe(2);
    expect(result.value.formId).toBe(form.id.getValue());
  });

  it('should return responsesOverTime grouped by day by default', async () => {
    const form = makeForm();
    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([]);
    responseRepo.findAllByFormId.mockResolvedValue([
      ResponseAggregate.reconstitute({
        id: { getValue: () => 'r1' } as any,
        formId: form.id.getValue(),
        organizationId,
        answers: [],
        submittedAt: new Date('2024-01-15'),
      }),
      ResponseAggregate.reconstitute({
        id: { getValue: () => 'r2' } as any,
        formId: form.id.getValue(),
        organizationId,
        answers: [],
        submittedAt: new Date('2024-01-15'),
      }),
      ResponseAggregate.reconstitute({
        id: { getValue: () => 'r3' } as any,
        formId: form.id.getValue(),
        organizationId,
        answers: [],
        submittedAt: new Date('2024-01-16'),
      }),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    expect(result.value.responsesOverTime).toHaveLength(2);
    expect(result.value.responsesOverTime[0].date).toBe('2024-01-15');
    expect(result.value.responsesOverTime[0].count).toBe(2);
    expect(result.value.responsesOverTime[1].date).toBe('2024-01-16');
    expect(result.value.responsesOverTime[1].count).toBe(1);
  });

  it('should compute text/textarea/email metrics with recent responses', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'text');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'answer 1' }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'answer 2' }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('text');
    expect(metric.recentResponses).toContain('answer 1');
    expect(metric.recentResponses).toContain('answer 2');
    expect(metric).not.toHaveProperty('email');
  });

  it('should compute radio distribution metrics', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'radio', ['A', 'B', 'C']);
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'A' }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'A' }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'B' }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('radio');
    const optA = metric.distribution.find((d: any) => d.option === 'A');
    expect(optA.count).toBe(2);
    expect(optA.percentage).toBeCloseTo(66.7, 0);
  });

  it('should compute checkbox optionCounts and topCombinations', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'checkbox', ['X', 'Y', 'Z']);
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: ['X', 'Y'] }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: ['X'] }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: ['X', 'Y'] }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('checkbox');
    const xCount = metric.optionCounts.find((o: any) => o.option === 'X');
    expect(xCount.count).toBe(3);
    expect(metric.topCombinations[0].count).toBe(2);
  });

  it('should compute toggle yesCount and noCount', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'toggle');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: true }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: false }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: true }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('toggle');
    expect(metric.yesCount).toBe(2);
    expect(metric.noCount).toBe(1);
  });

  it('should compute number avg, median, min, max, histogram', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'number');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 10 }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 20 }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 30 }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('number');
    expect(metric.avg).toBe(20);
    expect(metric.median).toBe(20);
    expect(metric.min).toBe(10);
    expect(metric.max).toBe(30);
    expect(metric.histogram).toBeDefined();
  });

  it('should compute rating avg and distribution', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'rating');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 4 }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 5 }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 5 }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('rating');
    expect(metric.avg).toBeCloseTo(4.67, 1);
    const five = metric.distribution.find((d: any) => d.rating === 5);
    expect(five.count).toBe(2);
  });

  it('should compute date distribution', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'date');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: '2024-03-01' }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: '2024-03-01' }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: '2024-03-02' }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('date');
    expect(metric.distribution).toHaveLength(2);
    expect(metric.distribution[0].count).toBe(2);
  });

  it('should compute file totalUploads', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'file');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'file-url-1' }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: null }]),
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'file-url-2' }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const metric = result.value.questionMetrics[0] as any;
    expect(metric.type).toBe('file');
    expect(metric.totalUploads).toBe(2);
  });

  it('should not expose any respondent identifier in metrics', async () => {
    const form = makeForm();
    const question = makeQuestion(form.id.getValue(), 'text');
    const qId = question.id.getValue();

    formRepo.findById.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.findAllByFormId.mockResolvedValue([
      makeResponse(form.id.getValue(), [{ questionId: qId, value: 'hello' }]),
    ]);

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });

    const output = JSON.stringify(result.value);
    expect(output).not.toContain('email');
    expect(output).not.toContain('userId');
    expect(output).not.toContain('emailHash');
  });
});
