import { httpClient } from '@/services/http-client';
import type { FormSummary, FormDetail, CreateFormInput, UpdateFormInput } from './forms.types';

export async function listForms(status?: string): Promise<FormSummary[]> {
  const params = status ? { status } : undefined;
  const response = await httpClient.get<{ forms: FormSummary[] }>('/forms', { params });
  return response.data.forms;
}

export async function getForm(id: string): Promise<FormDetail> {
  const response = await httpClient.get<{ form: Omit<FormDetail, 'questions'>; questions: FormDetail['questions'] }>(`/forms/${id}`);
  return { ...response.data.form, questions: response.data.questions };
}

export async function createForm(data: CreateFormInput): Promise<{ formId: string }> {
  const response = await httpClient.post<{ formId: string }>('/forms', data);
  return response.data;
}

export async function updateForm(id: string, data: UpdateFormInput): Promise<void> {
  await httpClient.patch(`/forms/${id}`, data);
}

export async function deleteForm(id: string): Promise<void> {
  await httpClient.delete(`/forms/${id}`);
}

export async function publishForm(id: string): Promise<{ publicToken: string; publicUrl: string }> {
  const response = await httpClient.post<{ publicToken: string; publicUrl: string }>(
    `/forms/${id}/publish`,
  );
  return response.data;
}

export async function closeForm(id: string): Promise<void> {
  await httpClient.post(`/forms/${id}/close`);
}

export async function expireForm(id: string): Promise<void> {
  await httpClient.post(`/forms/${id}/expire`);
}

export async function addQuestion(
  formId: string,
  data: object,
): Promise<{ questionId: string }> {
  const response = await httpClient.post<{ questionId: string }>(
    `/forms/${formId}/questions`,
    data,
  );
  return response.data;
}

export async function updateQuestion(
  formId: string,
  questionId: string,
  data: object,
): Promise<void> {
  await httpClient.patch(`/forms/${formId}/questions/${questionId}`, data);
}

export async function removeQuestion(formId: string, questionId: string): Promise<void> {
  await httpClient.delete(`/forms/${formId}/questions/${questionId}`);
}

export async function reorderQuestions(
  formId: string,
  questions: { id: string; order: number }[],
): Promise<void> {
  await httpClient.patch(`/forms/${formId}/questions/reorder`, { questions });
}
