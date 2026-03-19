import { ListResponsesUseCase } from './list-responses.usecase';
import { IFormRepository } from '@modules/forms/domain/repositories/form.repository';
import { IResponseRepository } from '../repositories/response.repository';
import { FormAggregate } from '@modules/forms/domain/aggregate/form.aggregate';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { FormStatus } from '@modules/forms/domain/aggregate/value-objects/form-status.vo';
import { PublicToken } from '@modules/forms/domain/aggregate/value-objects/public-token.vo';
import { ResponseAggregate } from '../aggregate/response.aggregate';
import { Output } from '@shared/output';

describe('ListResponsesUseCase', () => {
  let useCase: ListResponsesUseCase;
  let formRepo: jest.Mocked<IFormRepository>;
  let responseRepo: jest.Mocked<IResponseRepository>;

  const organizationId = 'org-123';

  const makeForm = (orgId = organizationId) =>
    FormAggregate.reconstitute({
      id: FormId.create(),
      organizationId: orgId,
      createdBy: 'user-1',
      title: 'Test Form',
      publicToken: PublicToken.from('token-123'),
      settings: { allowMultipleResponses: false, allowedEmailDomains: [] },
      status: FormStatus.active(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const makeResponse = (formId: string) =>
    ResponseAggregate.create({
      formId,
      organizationId,
      answers: [{ questionId: 'q-1', value: 'hello' }],
    });

  beforeEach(() => {
    formRepo = {
      findById: jest.fn(),
      findByPublicToken: jest.fn(),
      findByOrganizationId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    responseRepo = {
      save: jest.fn(),
      findByFormId: jest.fn(),
      findAllByFormId: jest.fn(),
      countByFormId: jest.fn(),
      deleteByFormId: jest.fn(),
    };

    useCase = new ListResponsesUseCase(formRepo, responseRepo);
  });

  it('should return paginated responses for valid form', async () => {
    const form = makeForm();
    const formId = form.id.getValue();
    const response = makeResponse(formId);

    formRepo.findById.mockResolvedValue(Output.ok(form));
    responseRepo.findByFormId.mockResolvedValue([response]);
    responseRepo.countByFormId.mockResolvedValue(1);

    const result = await useCase.execute({ organizationId, formId, offset: 0, limit: 20 });

    expect(result.isFailure).toBe(false);
    expect(result.value.responses).toHaveLength(1);
    expect(result.value.total).toBe(1);
    expect(result.value.offset).toBe(0);
    expect(result.value.limit).toBe(20);
  });

  it('should return 404 if form does not exist', async () => {
    formRepo.findById.mockResolvedValue(Output.fail('Form not found'));

    const result = await useCase.execute({ organizationId, formId: 'no-form' });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('not found');
  });

  it('should return 403 if form belongs to another org', async () => {
    const form = makeForm('other-org');
    formRepo.findById.mockResolvedValue(Output.ok(form));

    const result = await useCase.execute({ organizationId, formId: form.id.getValue() });
    expect(result.isFailure).toBe(true);
    expect(result.errorMessage).toContain('Forbidden');
  });

  it('should confirm no email/hash in responses', async () => {
    const form = makeForm();
    const formId = form.id.getValue();
    const response = makeResponse(formId);

    formRepo.findById.mockResolvedValue(Output.ok(form));
    responseRepo.findByFormId.mockResolvedValue([response]);
    responseRepo.countByFormId.mockResolvedValue(1);

    const result = await useCase.execute({ organizationId, formId });

    const responseItem = result.value.responses[0];
    expect(responseItem).not.toHaveProperty('email');
    expect(responseItem).not.toHaveProperty('emailHash');
    expect(responseItem).not.toHaveProperty('userId');
  });
});
