import { RemoveQuestionUseCase } from './remove-question.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { IQuestionRepository } from '../repositories/question.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { QuestionEntity } from '../aggregate/question.entity';
import { Output } from '@shared/output';

function makeForm(organizationId: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Test Form' });
}

function makeQuestion(formId: string, organizationId: string): QuestionEntity {
  return QuestionEntity.create({
    formId,
    organizationId,
    type: 'text',
    label: 'Some Question',
    required: false,
    order: 0,
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
  save: jest.fn(),
  findById: jest.fn(),
  findByFormId: jest.fn(),
  findByFormIdOrdered: jest.fn(),
  countByFormId: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
  deleteByFormId: jest.fn(),
};

describe('RemoveQuestionUseCase', () => {
  let useCase: RemoveQuestionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestionRepository.delete.mockResolvedValue(undefined);
    useCase = new RemoveQuestionUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should remove question', async () => {
    const form = makeForm('org-1');
    const question = makeQuestion(form.id.getValue(), 'org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findById.mockResolvedValue(Output.ok(question));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      questionId: question.id.getValue(),
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.removed).toBe(true);
    expect(mockQuestionRepository.delete).toHaveBeenCalledWith(question.id);
  });

  it('should reject question from another form', async () => {
    const form = makeForm('org-1');
    const otherForm = makeForm('org-1');
    const question = makeQuestion(otherForm.id.getValue(), 'org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findById.mockResolvedValue(Output.ok(question));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      questionId: question.id.getValue(),
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Question not found');
    expect(mockQuestionRepository.delete).not.toHaveBeenCalled();
  });
});
