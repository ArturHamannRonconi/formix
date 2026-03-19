import { Inject, Injectable } from '@nestjs/common';
import { Output } from '@shared/output';
import { IFormRepository, FORM_REPOSITORY } from '@modules/forms/domain/repositories/form.repository';
import { IQuestionRepository, QUESTION_REPOSITORY } from '@modules/forms/domain/repositories/question.repository';
import { IResponseRepository, RESPONSE_REPOSITORY } from '@modules/responses/domain/repositories/response.repository';
import { FormId } from '@modules/forms/domain/aggregate/value-objects/form-id.vo';
import { ResponseAggregate } from '@modules/responses/domain/aggregate/response.aggregate';

export interface GetFormAnalyticsInput {
  organizationId: string;
  formId: string;
  groupBy?: 'day' | 'week' | 'month';
}

export type TextMetric = { questionId: string; type: 'text' | 'textarea' | 'email'; recentResponses: string[] };
export type RadioMetric = { questionId: string; type: 'radio' | 'dropdown'; distribution: { option: string; count: number; percentage: number }[] };
export type CheckboxMetric = { questionId: string; type: 'checkbox'; optionCounts: { option: string; count: number }[]; topCombinations: { combination: string[]; count: number }[] };
export type ToggleMetric = { questionId: string; type: 'toggle'; yesCount: number; noCount: number };
export type NumberMetric = { questionId: string; type: 'number'; avg: number; median: number; min: number; max: number; histogram: { range: string; count: number }[] };
export type DateMetric = { questionId: string; type: 'date'; distribution: { date: string; count: number }[] };
export type RatingMetric = { questionId: string; type: 'rating'; avg: number; distribution: { rating: number; count: number }[] };
export type FileMetric = { questionId: string; type: 'file'; totalUploads: number };

export type QuestionMetric = TextMetric | RadioMetric | CheckboxMetric | ToggleMetric | NumberMetric | DateMetric | RatingMetric | FileMetric;

export interface AnalyticsDto {
  formId: string;
  totalResponses: number;
  responsesOverTime: { date: string; count: number }[];
  questionMetrics: QuestionMetric[];
}

@Injectable()
export class GetFormAnalyticsUseCase {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly formRepository: IFormRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: IQuestionRepository,
    @Inject(RESPONSE_REPOSITORY) private readonly responseRepository: IResponseRepository,
  ) {}

  async execute(input: GetFormAnalyticsInput): Promise<Output<AnalyticsDto>> {
    let formId: FormId;
    try {
      formId = FormId.from(input.formId);
    } catch {
      return Output.fail('Form not found');
    }

    const formResult = await this.formRepository.findById(formId);
    if (formResult.isFailure) return Output.fail('Form not found');

    const form = formResult.value;
    if (form.organizationId !== input.organizationId) {
      return Output.fail('Forbidden');
    }

    const [questions, responses] = await Promise.all([
      this.questionRepository.findByFormIdOrdered(input.formId),
      this.responseRepository.findAllByFormId(input.formId),
    ]);

    const groupBy = input.groupBy ?? 'day';
    const responsesOverTime = this.computeResponsesOverTime(responses, groupBy);
    const questionMetrics = questions.map(q => this.computeMetric(q.id.getValue(), q.type.getValue(), responses));

    return Output.ok({
      formId: input.formId,
      totalResponses: responses.length,
      responsesOverTime,
      questionMetrics,
    });
  }

  private computeResponsesOverTime(responses: ResponseAggregate[], groupBy: 'day' | 'week' | 'month'): { date: string; count: number }[] {
    const map = new Map<string, number>();
    for (const r of responses) {
      const key = this.formatDate(r.submittedAt, groupBy);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private formatDate(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    if (groupBy === 'month') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (groupBy === 'week') {
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      return startOfWeek.toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  }

  private computeMetric(questionId: string, type: string, responses: ResponseAggregate[]): QuestionMetric {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'email':
        return this.computeTextMetric(questionId, type as 'text' | 'textarea' | 'email', responses);
      case 'radio':
      case 'dropdown':
        return this.computeRadioMetric(questionId, type as 'radio' | 'dropdown', responses);
      case 'checkbox':
        return this.computeCheckboxMetric(questionId, responses);
      case 'toggle':
        return this.computeToggleMetric(questionId, responses);
      case 'number':
        return this.computeNumberMetric(questionId, responses);
      case 'date':
        return this.computeDateMetric(questionId, responses);
      case 'rating':
        return this.computeRatingMetric(questionId, responses);
      case 'file':
        return this.computeFileMetric(questionId, responses);
      default:
        return { questionId, type: 'text', recentResponses: [] };
    }
  }

  private computeTextMetric(questionId: string, type: 'text' | 'textarea' | 'email', responses: ResponseAggregate[]): TextMetric {
    const recent = [...responses]
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .map(r => r.answers.find(a => a.questionId === questionId)?.value)
      .filter((v): v is string => typeof v === 'string')
      .slice(0, 10);
    return { questionId, type, recentResponses: recent };
  }

  private computeRadioMetric(questionId: string, type: 'radio' | 'dropdown', responses: ResponseAggregate[]): RadioMetric {
    const optionCounts = new Map<string, number>();
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer && typeof answer.value === 'string') {
        optionCounts.set(answer.value, (optionCounts.get(answer.value) ?? 0) + 1);
      }
    }
    const total = Array.from(optionCounts.values()).reduce((s, c) => s + c, 0);
    const distribution = Array.from(optionCounts.entries()).map(([option, count]) => ({
      option,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));
    return { questionId, type, distribution };
  }

  private computeCheckboxMetric(questionId: string, responses: ResponseAggregate[]): CheckboxMetric {
    const optionCounts = new Map<string, number>();
    const combinationCounts = new Map<string, number>();
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer && Array.isArray(answer.value)) {
        const selected = answer.value as string[];
        for (const opt of selected) {
          optionCounts.set(opt, (optionCounts.get(opt) ?? 0) + 1);
        }
        const combo = [...selected].sort().join('|');
        combinationCounts.set(combo, (combinationCounts.get(combo) ?? 0) + 1);
      }
    }
    const optionCountsArr = Array.from(optionCounts.entries()).map(([option, count]) => ({ option, count }));
    const topCombinations = Array.from(combinationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([combo, count]) => ({ combination: combo ? combo.split('|') : [], count }));
    return { questionId, type: 'checkbox', optionCounts: optionCountsArr, topCombinations };
  }

  private computeToggleMetric(questionId: string, responses: ResponseAggregate[]): ToggleMetric {
    let yesCount = 0;
    let noCount = 0;
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer !== undefined) {
        if (answer.value === true || answer.value === 'true') yesCount++;
        else noCount++;
      }
    }
    return { questionId, type: 'toggle', yesCount, noCount };
  }

  private computeNumberMetric(questionId: string, responses: ResponseAggregate[]): NumberMetric {
    const values: number[] = [];
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer && typeof answer.value === 'number') {
        values.push(answer.value);
      }
    }
    if (values.length === 0) {
      return { questionId, type: 'number', avg: 0, median: 0, min: 0, max: 0, histogram: [] };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const histogram = this.buildHistogram(sorted, min, max);
    return { questionId, type: 'number', avg, median, min, max, histogram };
  }

  private buildHistogram(sorted: number[], min: number, max: number): { range: string; count: number }[] {
    const bucketCount = 5;
    if (max === min) {
      return [{ range: `${min}`, count: sorted.length }];
    }
    const bucketSize = (max - min) / bucketCount;
    return Array.from({ length: bucketCount }, (_, i) => {
      const low = min + i * bucketSize;
      const high = i === bucketCount - 1 ? max + 0.001 : min + (i + 1) * bucketSize;
      const label = `${Math.round(low)}-${Math.round(i === bucketCount - 1 ? max : high)}`;
      return { range: label, count: sorted.filter(v => v >= low && v < high).length };
    });
  }

  private computeDateMetric(questionId: string, responses: ResponseAggregate[]): DateMetric {
    const dateCounts = new Map<string, number>();
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer && answer.value != null) {
        const raw = answer.value as string;
        const dateStr = typeof raw === 'string' ? raw.split('T')[0] : String(raw);
        dateCounts.set(dateStr, (dateCounts.get(dateStr) ?? 0) + 1);
      }
    }
    const distribution = Array.from(dateCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
    return { questionId, type: 'date', distribution };
  }

  private computeRatingMetric(questionId: string, responses: ResponseAggregate[]): RatingMetric {
    const ratingCounts = new Map<number, number>();
    let sum = 0;
    let total = 0;
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer && typeof answer.value === 'number') {
        const rating = answer.value;
        ratingCounts.set(rating, (ratingCounts.get(rating) ?? 0) + 1);
        sum += rating;
        total++;
      }
    }
    const avg = total > 0 ? sum / total : 0;
    const distribution = Array.from(ratingCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rating, count]) => ({ rating, count }));
    return { questionId, type: 'rating', avg, distribution };
  }

  private computeFileMetric(questionId: string, responses: ResponseAggregate[]): FileMetric {
    let totalUploads = 0;
    for (const r of responses) {
      const answer = r.answers.find(a => a.questionId === questionId);
      if (answer && answer.value != null && answer.value !== '') {
        totalUploads++;
      }
    }
    return { questionId, type: 'file', totalUploads };
  }
}
