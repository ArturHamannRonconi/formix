'use client';

import { useState, useEffect } from 'react';
import { getFormAnalytics } from '@/services/analytics/analytics.service';
import type {
  FormAnalytics,
  QuestionMetric,
  RadioMetric,
  CheckboxMetric,
  ToggleMetric,
  NumberMetric,
  DateMetric,
  RatingMetric,
} from '@/services/analytics/analytics.types';

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface NormalizedQuestionMetric {
  questionId: string;
  type: QuestionMetric['type'];
  barData?: ChartDataItem[];
  pieData?: ChartDataItem[];
  lineData?: ChartDataItem[];
  ratingData?: ChartDataItem[];
  ratingAvg?: number;
  numberStats?: { avg: number; median: number; min: number; max: number };
  recentResponses?: string[];
  totalUploads?: number;
}

export interface NormalizedAnalytics {
  formId: string;
  totalResponses: number;
  overTimeData: ChartDataItem[];
  questionMetrics: NormalizedQuestionMetric[];
}

function normalizeMetric(metric: QuestionMetric): NormalizedQuestionMetric {
  switch (metric.type) {
    case 'radio':
    case 'dropdown': {
      const m = metric as RadioMetric;
      return {
        questionId: m.questionId,
        type: m.type,
        pieData: m.distribution.map((d) => ({ name: d.option, value: d.count })),
      };
    }
    case 'checkbox': {
      const m = metric as CheckboxMetric;
      return {
        questionId: m.questionId,
        type: m.type,
        barData: m.optionCounts.map((d) => ({ name: d.option, value: d.count })),
      };
    }
    case 'toggle': {
      const m = metric as ToggleMetric;
      return {
        questionId: m.questionId,
        type: m.type,
        pieData: [
          { name: 'Sim', value: m.yesCount },
          { name: 'Não', value: m.noCount },
        ],
      };
    }
    case 'number': {
      const m = metric as NumberMetric;
      return {
        questionId: m.questionId,
        type: m.type,
        barData: m.histogram.map((d) => ({ name: d.range, value: d.count })),
        numberStats: { avg: m.avg, median: m.median, min: m.min, max: m.max },
      };
    }
    case 'date': {
      const m = metric as DateMetric;
      return {
        questionId: m.questionId,
        type: m.type,
        lineData: m.distribution.map((d) => ({ name: d.date, value: d.count })),
      };
    }
    case 'rating': {
      const m = metric as RatingMetric;
      return {
        questionId: m.questionId,
        type: m.type,
        ratingData: m.distribution.map((d) => ({ name: String(d.rating), value: d.count })),
        ratingAvg: m.avg,
      };
    }
    default:
      return {
        questionId: metric.questionId,
        type: metric.type,
        recentResponses: 'recentResponses' in metric ? (metric.recentResponses as string[]) : [],
        totalUploads: 'totalUploads' in metric ? (metric.totalUploads as number) : undefined,
      };
  }
}

export function useAnalytics(formId: string, groupBy: 'day' | 'week' | 'month' = 'day') {
  const [data, setData] = useState<NormalizedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!formId) return;

    setIsLoading(true);
    setError('');

    getFormAnalytics(formId, groupBy)
      .then((raw: FormAnalytics) => {
        setData({
          formId: raw.formId,
          totalResponses: raw.totalResponses,
          overTimeData: raw.responsesOverTime.map((d) => ({ name: d.date, value: d.count })),
          questionMetrics: raw.questionMetrics.map(normalizeMetric),
        });
      })
      .catch(() => {
        setError('Erro ao carregar analytics.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [formId, groupBy]);

  return { data, isLoading, error };
}
