import { httpClient } from '@/services/http-client';
import type { FormAnalytics } from './analytics.types';

export async function getFormAnalytics(
  formId: string,
  groupBy?: 'day' | 'week' | 'month',
): Promise<FormAnalytics> {
  const params: Record<string, string> = {};
  if (groupBy) params.groupBy = groupBy;
  const response = await httpClient.get<FormAnalytics>(`/forms/${formId}/analytics`, { params });
  return response.data;
}
