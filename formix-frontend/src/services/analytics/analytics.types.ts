export interface ResponsesOverTime {
  date: string;
  count: number;
}

export interface TextMetric {
  questionId: string;
  type: 'text' | 'textarea' | 'email';
  recentResponses: string[];
}

export interface RadioMetric {
  questionId: string;
  type: 'radio' | 'dropdown';
  distribution: { option: string; count: number; percentage: number }[];
}

export interface CheckboxMetric {
  questionId: string;
  type: 'checkbox';
  optionCounts: { option: string; count: number }[];
  topCombinations: { combination: string[]; count: number }[];
}

export interface ToggleMetric {
  questionId: string;
  type: 'toggle';
  yesCount: number;
  noCount: number;
}

export interface NumberMetric {
  questionId: string;
  type: 'number';
  avg: number;
  median: number;
  min: number;
  max: number;
  histogram: { range: string; count: number }[];
}

export interface DateMetric {
  questionId: string;
  type: 'date';
  distribution: { date: string; count: number }[];
}

export interface RatingMetric {
  questionId: string;
  type: 'rating';
  avg: number;
  distribution: { rating: number; count: number }[];
}

export interface FileMetric {
  questionId: string;
  type: 'file';
  totalUploads: number;
}

export type QuestionMetric =
  | TextMetric
  | RadioMetric
  | CheckboxMetric
  | ToggleMetric
  | NumberMetric
  | DateMetric
  | RatingMetric
  | FileMetric;

export interface FormAnalytics {
  formId: string;
  totalResponses: number;
  responsesOverTime: ResponsesOverTime[];
  questionMetrics: QuestionMetric[];
}
