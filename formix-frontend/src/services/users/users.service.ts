import { httpClient } from '@/services/http-client';
import type { UserProfile, UpdateProfileInput } from './users.types';

export async function getProfile(): Promise<UserProfile> {
  const response = await httpClient.get<UserProfile>('/users/me');
  return response.data;
}

export async function updateProfile(data: UpdateProfileInput): Promise<void> {
  await httpClient.patch('/users/me', data);
}
