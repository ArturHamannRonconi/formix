import { SubmitResponseUseCase, SubmitResponseInput } from './submit-response.usecase';
import { IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { IQuestionRepository } from '@modules/forms/domain/repositories/question.repository';
import { IResponseRepository } from '../repositories/response.repository';
import { IResponseEmailRepository } from '../repositories/response-email.repository';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';
import { FormStatus } from '@modules/forms/domain/aggregate/value-objects/form-status.vo';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { QuestionEntity } from '@modules/forms/domain/aggregate/question.entity';
import { QuestionId } from '@modules/forms/domain/aggregate/value-objects/question-id.vo';
import { Output } from '@shared/output';

const makeActiveForm = (overrides: Partial<{
  allowMultipleResponses: boolean;
  allowedEmailDomains: string[];
  expiresAt: Date;
  maxResponses: number;
}> = {}) => {
  const form = FormAggregate.reconstitute({
    id: FormId.create(),
    organizationId: 'org-123',
    createdBy: 'user-1',
    title: 'Test Form',
    publicToken: PublicToken.from('test-token'),
    settings: {
      allowMultipleResponses: overrides.allowMultipleResponses ?? false,
      allowedEmailDomains: overrides.allowedEmailDomains ?? [],
      expiresAt: overrides.expiresAt,
      maxResponses: overrides.maxResponses,
    },
    status: FormStatus.active(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return form;
};

const makeQuestion = (formId: string, type = 'text', required = true, options?: string[]) =>
  QuestionEntity.reconstitute({
    id: QuestionId.create(),
    formId,
    organizationId: 'org-123',
    type: { getValue: () => type, requiresOptions: () => ['radio', 'checkbox', 'dropdown'].includes(type), equals: () => false } as any,
    label: 'Question',
    required,
    order: 1,
    options,
    createdAt: new Date(),
  });

describe('SubmitResponseUseCase', () => {
  let useCase: SubmitResponseUseCase;
  let formRepo: jest.Mocked<IFormRepository>;
  let questionRepo: jest.Mocked<IQuestionRepository>;
  let responseRepo: jest.Mocked<IResponseRepository>;
  let responseEmailRepo: jest.Mocked<IResponseEmailRepository>;

  const publicToken = 'test-token';
  const email = 'user@example.com';

  beforeEach(() => {
    formRepo = {
      findByPublicToken: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByOrganizationId: jest.fn(),
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
    responseEmailRepo = {
      save: jest.fn(),
      existsByFormIdAndEmailHash: jest.fn(),
      deleteByFormId: jest.fn(),
    };

    useCase = new SubmitResponseUseCase(formRepo, questionRepo, responseRepo, responseEmailRepo);
  });

  const validInput: SubmitResponseInput = {
    publicToken,
    email,
    answers: [],
  };

  it('should return 404 if form not found', async () => {
    formRepo.findByPublicToken.mockResolvedValue(Output.fail('Form not found'));
    const result = await useCase.execute(validInput);
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('not found');
  });

  it('should return error if form is not active', async () => {
    const form = FormAggregate.reconstitute({
      id: FormId.create(),
      organizationId: 'org-123',
      createdBy: 'user-1',
      title: 'Test',
      publicToken: PublicToken.from(publicToken),
      settings: { allowMultipleResponses: false, allowedEmailDomains: [] },
      status: FormStatus.from('draft'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    questionRepo.findByFormIdOrdered.mockResolvedValue([]);
    responseRepo.countByFormId.mockResolvedValue(0);
    responseEmailRepo.existsByFormIdAndEmailHash.mockResolvedValue(false);

    const result = await useCase.execute(validInput);
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('not active');
  });

  it('should return error if form is expired by date', async () => {
    const form = makeActiveForm({ expiresAt: new Date(Date.now() - 1000) });
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(0);

    const result = await useCase.execute(validInput);
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('expired');
    expect(formRepo.save).toHaveBeenCalled();
  });

  it('should return error if maxResponses reached', async () => {
    const form = makeActiveForm({ maxResponses: 5 });
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(5);

    const result = await useCase.execute(validInput);
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('limit');
    expect(formRepo.save).toHaveBeenCalled();
  });

  it('should return 403 if email domain not allowed', async () => {
    const form = makeActiveForm({ allowedEmailDomains: ['company.com'] });
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(0);

    const result = await useCase.execute({ ...validInput, email: 'user@other.com' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('domain');
  });

  it('should return 409 if duplicate submission not allowed', async () => {
    const form = makeActiveForm({ allowMultipleResponses: false });
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(0);
    responseEmailRepo.existsByFormIdAndEmailHash.mockResolvedValue(true);
    questionRepo.findByFormIdOrdered.mockResolvedValue([]);

    const result = await useCase.execute(validInput);
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('already responded');
  });

  it('should return 400 if required question not answered', async () => {
    const form = makeActiveForm();
    const qId = QuestionId.create();
    const question = makeQuestion(form.id.getValue(), 'text', true);
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(0);
    responseEmailRepo.existsByFormIdAndEmailHash.mockResolvedValue(false);
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);

    const result = await useCase.execute({ ...validInput, answers: [] });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('required');
  });

  it('should save response WITHOUT email or hash, and save email hash SEPARATELY', async () => {
    const form = makeActiveForm();
    const question = makeQuestion(form.id.getValue(), 'text', true);
    const questionId = question.id.getValue();
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(0);
    responseEmailRepo.existsByFormIdAndEmailHash.mockResolvedValue(false);
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.save.mockResolvedValue(undefined);
    responseEmailRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({
      publicToken,
      email,
      answers: [{ questionId, value: 'My answer' }],
    });

    expect(result.isFailure).toBe(false);
    expect(responseRepo.save).toHaveBeenCalledTimes(1);
    expect(responseEmailRepo.save).toHaveBeenCalledTimes(1);

    const savedResponse = responseRepo.save.mock.calls[0][0];
    // Response must NOT contain email or hash
    const responseKeys = Object.keys(savedResponse);
    expect(responseKeys).not.toContain('email');
    expect(responseKeys).not.toContain('emailHash');

    const savedEmailRecord = responseEmailRepo.save.mock.calls[0][0];
    // EmailRecord must NOT reference responseId
    const emailRecordKeys = Object.keys(savedEmailRecord);
    expect(emailRecordKeys).not.toContain('responseId');
  });

  it('should allow submission when allowMultipleResponses is true', async () => {
    const form = makeActiveForm({ allowMultipleResponses: true });
    const question = makeQuestion(form.id.getValue(), 'text', true);
    const questionId = question.id.getValue();
    formRepo.findByPublicToken.mockResolvedValue(Output.ok(form));
    responseRepo.countByFormId.mockResolvedValue(0);
    questionRepo.findByFormIdOrdered.mockResolvedValue([question]);
    responseRepo.save.mockResolvedValue(undefined);
    responseEmailRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({
      publicToken,
      email,
      answers: [{ questionId, value: 'text' }],
    });

    expect(result.isFailure).toBe(false);
    expect(responseEmailRepo.existsByFormIdAndEmailHash).not.toHaveBeenCalled();
  });
});
