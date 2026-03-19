import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Output } from '@shared/output';
import { IFormRepository, FORM_REPOSITORY } from '@modules/forms/domain/repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '@modules/forms/domain/repositories/question.repository';
import { IResponseRepository, RESPONSE_REPOSITORY } from '../repositories/response.repository';
import { IResponseEmailRepository, RESPONSE_EMAIL_REPOSITORY } from '../repositories/response-email.repository';
import { ResponseAggregate, Answer } from '../aggregate/response.aggregate';
import { ResponseEmailAggregate } from '../aggregate/response-email.aggregate';

export interface SubmitResponseInput {
  publicToken: string;
  email: string;
  answers: Answer[];
}

export interface SubmitResponseOutput {
  submitted: boolean;
}

@Injectable()
export class SubmitResponseUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
    @Inject(RESPONSE_REPOSITORY) private readonly responseRepository: IResponseRepository,
    @Inject(RESPONSE_EMAIL_REPOSITORY) private readonly responseEmailRepository: IResponseEmailRepository,
  ) {}

  async execute(input: SubmitResponseInput): Promise<Output<SubmitResponseOutput>> {
    // Step 1: Find form by publicToken
    const formResult = await this.formRepository.findByPublicToken(input.publicToken);
    if (formResult.isFailure) return Output.fail('Form not found');
    const form = formResult.value;

    // Step 2: Check form status
    if (!form.status.isActive()) return Output.fail('Form is not active');

    // Step 3: Check expiration by date
    if (form.settings.expiresAt && new Date() > form.settings.expiresAt) {
      form.close();
      await this.formRepository.save(form);
      return Output.fail('Form has expired');
    }

    // Step 4: Check maxResponses
    if (form.settings.maxResponses !== undefined) {
      const count = await this.responseRepository.countByFormId(form.id.getValue());
      if (count >= form.settings.maxResponses) {
        form.close();
        await this.formRepository.save(form);
        return Output.fail('Form has reached response limit');
      }
    }

    // Step 5: Check allowed email domains
    const { allowedEmailDomains } = form.settings;
    if (allowedEmailDomains.length > 0) {
      const emailDomain = input.email.toLowerCase().split('@')[1];
      if (!allowedEmailDomains.includes(emailDomain)) {
        return Output.fail('Email domain not allowed');
      }
    }

    // Step 6: Compute email hash
    const emailHash = createHash('sha256').update(input.email.toLowerCase()).digest('hex');

    // Step 7: Check duplicity
    if (!form.settings.allowMultipleResponses) {
      const exists = await this.responseEmailRepository.existsByFormIdAndEmailHash(
        form.id.getValue(),
        emailHash,
      );
      if (exists) return Output.fail('You have already responded to this form');
    }

    // Step 8: Fetch questions
    const questions = await this.questionRepository.findByFormIdOrdered(form.id.getValue());

    // Step 9: Validate answers
    const answersMap = new Map(input.answers.map(a => [a.questionId, a.value]));
    for (const question of questions) {
      const value = answersMap.get(question.id.getValue());
      const type = question.type.getValue();

      // Required check
      if (question.required && (value === undefined || value === null || value === '')) {
        return Output.fail(`Question "${question.label}" is required`);
      }

      if (value === undefined || value === null) continue;

      // Type-specific validation
      if (type === 'number') {
        const num = Number(value);
        if (isNaN(num)) return Output.fail(`Question "${question.label}" must be a number`);
        if (question.validation?.min !== undefined && num < question.validation.min) {
          return Output.fail(`Question "${question.label}" must be at least ${question.validation.min}`);
        }
        if (question.validation?.max !== undefined && num > question.validation.max) {
          return Output.fail(`Question "${question.label}" must be at most ${question.validation.max}`);
        }
      }

      if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          return Output.fail(`Question "${question.label}" must be a valid email`);
        }
      }

      if (type === 'radio' || type === 'dropdown') {
        if (!question.options?.includes(value as string)) {
          return Output.fail(`Question "${question.label}" has an invalid option`);
        }
      }

      if (type === 'checkbox') {
        if (!Array.isArray(value)) {
          return Output.fail(`Question "${question.label}" must be an array of options`);
        }
        const invalidOptions = (value as string[]).filter(v => !question.options?.includes(v));
        if (invalidOptions.length > 0) {
          return Output.fail(`Question "${question.label}" has invalid options`);
        }
      }

      if (type === 'date') {
        const date = new Date(value as string);
        if (isNaN(date.getTime())) {
          return Output.fail(`Question "${question.label}" must be a valid date`);
        }
      }

      if (type === 'rating') {
        const num = Number(value);
        const max = question.validation?.max ?? 5;
        if (isNaN(num) || num < 1 || num > max) {
          return Output.fail(`Question "${question.label}" rating must be between 1 and ${max}`);
        }
      }

      if (type === 'text' || type === 'textarea') {
        if (question.validation?.pattern) {
          const regex = new RegExp(question.validation.pattern);
          if (!regex.test(value as string)) {
            return Output.fail(`Question "${question.label}" does not match required pattern`);
          }
        }
      }
    }

    // Step 10: Save response WITHOUT email or hash
    const response = ResponseAggregate.create({
      formId: form.id.getValue(),
      organizationId: form.organizationId,
      answers: input.answers,
    });
    await this.responseRepository.save(response);

    // Step 11: Save email hash SEPARATELY — no reference to response
    const responseEmail = ResponseEmailAggregate.create(form.id.getValue(), emailHash);
    await this.responseEmailRepository.save(responseEmail);

    return Output.ok({ submitted: true });
  }
}
