import { PublishFormUseCase } from './publish-form.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { IQuestionRepository } from '../repositories/question.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { FormStatus } from '../aggregate/value-objects/form-status.vo';
import { PublicToken } from '../aggregate/value-objects/public-token.vo';
import { Output } from '@shared/output';

function makeDraftForm(organizationId: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Test Form' });
}

function makeActiveForm(organizationId: string): FormAggregate {
  const form = FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Test Form' });
  form.publish(PublicToken.generate());
  return form;
}

const mockFormRepository: jest.Mocked<IFormRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByOrganizationId: jest.fn(),
  findByPublicToken: jest.fn(),
  delete: jest.fn(),
};

const mockQuestionRepository: jest.Mocked<IQuestionRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByFormId: jest.fn(),
  findByFormIdOrdered: jest.fn(),
  countByFormId: jest.fn(),
  delete: jest.fn(),
  deleteByFormId: jest.fn(),
};

describe('PublishFormUseCase', () => {
  let useCase: PublishFormUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new PublishFormUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should publish draft form with questions', async () => {
    const form = makeDraftForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.countByFormId.mockResolvedValue(2);
    mockFormRepository.save.mockResolvedValue(undefined);

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(false);
    expect(output.value.publicToken).toBeDefined();
    expect(output.value.publicUrl).toContain(output.value.publicToken);
    expect(mockFormRepository.save).toHaveBeenCalled();
  });

  it('should reject form without questions', async () => {
    const form = makeDraftForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.countByFormId.mockResolvedValue(0);

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form must have at least one question');
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });

  it('should reject form already active (not draft)', async () => {
    const form = makeActiveForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.countByFormId.mockResolvedValue(2);

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form is not in draft status');
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });

  it('should reject form from another org', async () => {
    const form = makeDraftForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({ organizationId: 'org-2', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });
});
