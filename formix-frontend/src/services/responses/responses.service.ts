import axios from 'axios';
import { httpClient } from '@/services/http-client';
import type {
  PublicForm,
  SubmitResponseInput,
  ListResponsesOutput,
} from './responses.types';

const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export async function getPublicForm(publicToken: string): Promise<PublicForm> {
  const response = await publicClient.get<PublicForm>(`/forms/public/${publicToken}`);
  return response.data;
}

export async function submitResponse(
  publicToken: string,
  data: SubmitResponseInput,
): Promise<{ submitted: boolean }> {
  const response = await publicClient.post<{ submitted: boolean }>(
    `/responses/${publicToken}`,
    data,
  );
  return response.data;
}

export async function listResponses(
  formId: string,
  offset = 0,
  limit = 20,
  search?: string,
  sortBy?: string,
  sortDir?: 'asc' | 'desc',
): Promise<ListResponsesOutput> {
  const response = await httpClient.get<ListResponsesOutput>(
    `/forms/${formId}/responses`,
    {
      params: {
        offset,
        limit,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortDir && { sortDir }),
      },
    },
  );
  return response.data;
}
