import { UpdateQuestionUseCase } from './update-question.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { IQuestionRepository } from '../repositories/question.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { QuestionEntity } from '../aggregate/question.entity';
import { Output } from '@shared/output';

function makeForm(organizationId: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Test Form' });
}

function makeQuestion(formId: string, organizationId: string, type = 'text', options?: string[]): QuestionEntity {
  return QuestionEntity.create({
    formId,
    organizationId,
    type,
    label: 'Original Label',
    required: false,
    order: 0,
    options,
  });
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

describe('UpdateQuestionUseCase', () => {
  let useCase: UpdateQuestionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestionRepository.save.mockResolvedValue(undefined);
    useCase = new UpdateQuestionUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should update label', async () => {
    const form = makeForm('org-1');
    const question = makeQuestion(form.id.getValue(), 'org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findById.mockResolvedValue(Output.ok(question));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      questionId: question.id.getValue(),
      label: 'Updated Label',
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.updated).toBe(true);
    expect(question.label).toBe('Updated Label');
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(question);
  });

  it('should reject when options removed from radio', async () => {
    const form = makeForm('org-1');
    const question = makeQuestion(form.id.getValue(), 'org-1', 'radio', ['Option A', 'Option B']);
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findById.mockResolvedValue(Output.ok(question));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      questionId: question.id.getValue(),
      options: [],
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toContain('requires at least one option');
    expect(mockQuestionRepository.save).not.toHaveBeenCalled();
  });
});
