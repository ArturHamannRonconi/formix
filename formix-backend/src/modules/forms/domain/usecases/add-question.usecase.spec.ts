import { AddQuestionUseCase } from './add-question.usecase';
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
  delete: jest.fn(),
};

const mockQuestionRepository: jest.Mocked<IQuestionRepository> = {
  save: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  findByFormId: jest.fn(),
  findByFormIdOrdered: jest.fn(),
  countByFormId: jest.fn(),
  delete: jest.fn(),
  deleteByFormId: jest.fn(),
};

describe('AddQuestionUseCase', () => {
  let useCase: AddQuestionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestionRepository.save.mockResolvedValue(undefined);
    useCase = new AddQuestionUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should add question to existing form', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.countByFormId.mockResolvedValue(0);

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      type: 'text',
      label: 'Your name',
      required: false,
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.questionId).toBeDefined();
    expect(mockQuestionRepository.save).toHaveBeenCalled();
  });

  it('should auto-assign order based on existing count', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.countByFormId.mockResolvedValue(3);

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      type: 'text',
      label: 'Question 4',
      required: false,
    });

    expect(output.isFailure).toBe(false);
    const savedQuestion = mockQuestionRepository.save.mock.calls[0][0];
    expect(savedQuestion.order).toBe(3);
  });

  it('should reject radio without options', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.countByFormId.mockResolvedValue(0);

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      type: 'radio',
      label: 'Pick one',
      required: true,
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toContain('requires at least one option');
  });

  it('should reject form from another org', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({
      organizationId: 'org-2',
      formId: form.id.getValue(),
      type: 'text',
      label: 'Name',
      required: false,
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
    expect(mockQuestionRepository.save).not.toHaveBeenCalled();
  });
});
