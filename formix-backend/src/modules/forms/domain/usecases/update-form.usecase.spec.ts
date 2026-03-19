import { UpdateFormUseCase } from './update-form.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { Output } from '@shared/output';

function makeForm(organizationId: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Original Title' });
}

const mockFormRepository: jest.Mocked<IFormRepository> = {
  save: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  findByOrganizationId: jest.fn(),
  findByPublicToken: jest.fn(),
  delete: jest.fn(),
};

describe('UpdateFormUseCase', () => {
  let useCase: UpdateFormUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateFormUseCase(mockFormRepository);
  });

  it('should update form title', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      title: 'New Title',
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.updated).toBe(true);
    expect(mockFormRepository.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' }));
  });

  it('should reject form from another org', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({
      organizationId: 'org-2',
      formId: form.id.getValue(),
      title: 'New Title',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });

  it('should return failure if form not found', async () => {
    mockFormRepository.findById.mockResolvedValue(Output.fail('Not found'));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: 'non-existent',
      title: 'Title',
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
  });
});
