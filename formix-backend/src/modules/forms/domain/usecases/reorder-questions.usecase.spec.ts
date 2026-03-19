import { ReorderQuestionsUseCase } from './reorder-questions.usecase';
import { IFormRepository } from '../repositories/form.repository';
import { IQuestionRepository } from '../repositories/question.repository';
import { FormAggregate } from '../aggregate/form.aggregate';
import { QuestionEntity } from '../aggregate/question.entity';
import { Output } from '@shared/output';

function makeForm(organizationId: string): FormAggregate {
  return FormAggregate.create({ organizationId, createdBy: 'user-1', title: 'Test Form' });
}

function makeQuestion(formId: string, organizationId: string, order = 0): QuestionEntity {
  return QuestionEntity.create({
    formId,
    organizationId,
    type: 'text',
    label: `Question ${order}`,
    required: false,
    order,
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

describe('ReorderQuestionsUseCase', () => {
  let useCase: ReorderQuestionsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuestionRepository.save.mockResolvedValue(undefined);
    useCase = new ReorderQuestionsUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should reorder questions', async () => {
    const form = makeForm('org-1');
    const q1 = makeQuestion(form.id.getValue(), 'org-1', 0);
    const q2 = makeQuestion(form.id.getValue(), 'org-1', 1);
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findById
      .mockResolvedValueOnce(Output.ok(q1))
      .mockResolvedValueOnce(Output.ok(q2));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      questions: [
        { id: q1.id.getValue(), order: 1 },
        { id: q2.id.getValue(), order: 0 },
      ],
    });

    expect(output.isFailure).toBe(false);
    expect(output.value.reordered).toBe(true);
    expect(q1.order).toBe(1);
    expect(q2.order).toBe(0);
    expect(mockQuestionRepository.save).toHaveBeenCalledTimes(2);
  });

  it('should reject questionId not belonging to form', async () => {
    const form = makeForm('org-1');
    const otherForm = makeForm('org-1');
    const question = makeQuestion(otherForm.id.getValue(), 'org-1', 0);
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findById.mockResolvedValue(Output.ok(question));

    const output = await useCase.execute({
      organizationId: 'org-1',
      formId: form.id.getValue(),
      questions: [{ id: question.id.getValue(), order: 0 }],
    });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Question not found');
    expect(mockQuestionRepository.save).not.toHaveBeenCalled();
  });
});
