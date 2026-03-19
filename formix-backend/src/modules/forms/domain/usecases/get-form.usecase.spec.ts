import { GetFormUseCase } from './get-form.usecase';
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
    label: 'Name',
    required: true,
    order: 1,
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
  delete: jest.fn(),
  deleteByFormId: jest.fn(),
};

describe('GetFormUseCase', () => {
  let useCase: GetFormUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetFormUseCase(mockFormRepository, mockQuestionRepository);
  });

  it('should return form with questions', async () => {
    const form = makeForm('org-1');
    const question = makeQuestion(form.id.getValue(), 'org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));
    mockQuestionRepository.findByFormIdOrdered.mockResolvedValue([question]);

    const output = await useCase.execute({ organizationId: 'org-1', formId: form.id.getValue() });

    expect(output.isFailure).toBe(false);
    expect(output.value.form.id).toBe(form.id.getValue());
    expect(output.value.questions).toHaveLength(1);
    expect(output.value.questions[0].label).toBe('Name');
  });

  it('should reject form from another org', async () => {
    const form = makeForm('org-1');
    mockFormRepository.findById.mockResolvedValue(Output.ok(form));

    const output = await useCase.execute({ organizationId: 'org-2', formId: form.id.getValue() });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
  });

  it('should return failure if form does not exist', async () => {
    mockFormRepository.findById.mockResolvedValue(Output.fail('Not found'));

    const output = await useCase.execute({ organizationId: 'org-1', formId: 'some-id' });

    expect(output.isFailure).toBe(true);
    expect(output.errorMessage).toBe('Form not found');
  });
});
