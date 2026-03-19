import { CloseFormUseCase } from './close-form.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
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

describe('CloseFormUseCase', () => {
  let useCase: CloseFormUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CloseFormUseCase(mockFormRepository);
  });

  it('should close active form', async () => {
    const form = makeActiveForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockFormRepository.save.mockResolvedValue(undefined);

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(false);
    expect(output.value.closed).toBe(true);
    expect(mockFormRepository.save).toHaveBeenCalled();
  });

  it('should reject form not active (draft)', async () => {
    const form = makeDraftForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form is not active');
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });

  it('should reject form from another org', async () => {
    const form = makeActiveForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({ organizationId: 'org-2', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
    expect(mockFormRepository.save).not.toHaveBeenCalled();
  });
});
