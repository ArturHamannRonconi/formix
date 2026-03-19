import { DeleteFormUseCase } from './delete-form.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { IQuestionRepository } from '../repositories/question.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { Output } from '@shared/output';

function makeForm(organizationId: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Test Form' });
}

const mockFormRepository: jest.Mocked<IFormRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByOrganizationId: jest.fn(),
  findByPublicToken: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
};

const mockQuestionRepository: jest.Mocked<IQuestionRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByFormId: jest.fn(),
  findByFormIdOrdered: jest.fn(),
  countByFormId: jest.fn(),
  delete: jest.fn(),
  deleteByFormId: jest.fn().mockResolvedValue(undefined),
};

describe('DeleteFormUseCase', () => {
  let useCase: DeleteFormUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteFormUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should delete form and cascade to questions', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(false);
    expect(output.value.deleted).toBe(true);
    expect(mockQuestionRepository.deleteByFormId).toHaveBeenCalledWith(form.id.getValue());
    expect(mockFormRepository.delete).toHaveBeenCalledWith(form.id);
  });

  it('should reject form from another org', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({ organizationId: 'org-2', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
    expect(mockQuestionRepository.deleteByFormId).not.toHaveBeenCalled();
    expect(mockFormRepository.delete).not.toHaveBeenCalled();
  });

  it('should return failure if form not found', async () => {
    mockFormRepository.findById.mockResolvedValue(Output.fail('Not found'));

    const output = await useCase.execute({ organizationId: 'org-1', formId: 'non-existent' });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
  });
});
