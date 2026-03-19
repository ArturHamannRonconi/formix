import { CreateFormUseCase } from './create-form.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { Output } from '@shared/output';

const mockFormRepository: jest.Mocked<IFormRepository> = {
  save: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  findByOrganizationId: jest.fn(),
  findByPublicToken: jest.fn(),
  delete: jest.fn(),
};

describe('CreateFormUseCase', () => {
  let useCase: CreateFormUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateFormUseCase(mockFormRepository);
  });

  it('should create a form with draft status', async () => {
    const input = {
      organizationId: 'org-1',
      createdBy: 'user-1',
      title: 'Test Form',
      description: 'A test form',
    };

    const output = await useCase.execute(input);

    expect(output.isFailure).toBe(false);
    expect(output.value.formId).toBeDefined();
    expect(mockFormRepository.save).toHaveBeenCalledTimes(1);

    const savedForm = mockFormRepository.save.mock.calls[0][0] as FormAggregate;
    expect(savedForm.status.isDraft()).toBe(true);
  });

  it('should create a form with correct organizationId', async () => {
    const input = {
      organizationId: 'org-abc',
      createdBy: 'user-xyz',
      title: 'My Form',
    };

    const output = await useCase.execute(input);

    expect(output.isFailure).toBe(false);
    const savedForm = mockFormRepository.save.mock.calls[0][0] as FormAggregate;
    expect(savedForm.organizationId).toBe('org-abc');
  });

  it('should return formId in output', async () => {
    const input = {
      organizationId: 'org-1',
      createdBy: 'user-1',
      title: 'Another Form',
    };

    const output = await useCase.execute(input);

    expect(output.isFailure).toBe(false);
    expect(typeof output.value.formId).toBe('string');
    expect(output.value.formId.length).toBeGreaterThan(0);
  });

  it('should return failure if title is empty', async () => {
    const input = {
      organizationId: 'org-1',
      createdBy: 'user-1',
      title: '',
    };

    const output = await useCase.execute(input);

    expect(output.isFailure).toBe(true);
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });
});
