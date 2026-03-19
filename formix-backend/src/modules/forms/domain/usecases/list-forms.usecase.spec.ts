import { ListFormsUseCase } from './list-forms.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { FormAggregate } from '../aggregate/form.aggregate';

function makeForm(organizationId: string, title: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title });
}

const mockFormRepository: jest.Mocked<IFormRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByOrganizationId: jest.fn(),
  findByPublicToken: jest.fn(),
  delete: jest.fn(),
};

describe('ListFormsUseCase', () => {
  let useCase: ListFormsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListFormsUseCase(mockFormRepository);
  });

  it('should list only forms from org', async () => {
    const form1 = makeForm('org-1', 'Form 1');
    const form2 = makeForm('org-1', 'Form 2');
    mockFormRepository.findByOrganizationId.mockResolvedValue([form1, form2]);

    const output = await useCase.execute({ organizationId: 'org-1' });

    expect(output.isFailure).toBe(false);
    expect(output.value.forms).toHaveLength(2);
    expect(output.value.forms[0].organizationId).toBe('org-1');
    expect(output.value.forms[1].organizationId).toBe('org-1');
    expect(mockFormRepository.findByOrganizationId).toHaveBeenCalledWith('org-1', undefined);
  });

  it('should filter by status correctly', async () => {
    const form = makeForm('org-1', 'Draft Form');
    mockFormRepository.findByOrganizationId.mockResolvedValue([form]);

    const output = await useCase.execute({ organizationId: 'org-1', status: 'draft' });

    expect(output.isFailure).toBe(false);
    expect(output.value.forms).toHaveLength(1);
    expect(mockFormRepository.findByOrganizationId).toHaveBeenCalledWith('org-1', 'draft');
  });

  it('should return empty array when no forms exist', async () => {
    mockFormRepository.findByOrganizationId.mockResolvedValue([]);

    const output = await useCase.execute({ organizationId: 'org-empty' });

    expect(output.isFailure).toBe(false);
    expect(output.value.forms).toHaveLength(0);
  });

  it('should map form data correctly', async () => {
    const form = makeForm('org-1', 'My Form');
    mockFormRepository.findByOrganizationId.mockResolvedValue([form]);

    const output = await useCase.execute({ organizationId: 'org-1' });

    expect(output.isFailure).toBe(false);
    const summary = output.value.forms[0];
    expect(summary.id).toBe(form.id.getValue());
    expect(summary.title).toBe('My Form');
    expect(summary.status).toBe('draft');
    expect(summary.createdAt).toBeInstanceOf(Date);
    expect(summary.updatedAt).toBeInstanceOf(Date);
  });
});
