import { httpClient } from '@/services/http-client';
import type { LoginResponse, SignupData, SignupResponse } from './auth.types';

export async function signup(data: SignupData): Promise<SignupResponse> {
  const response = await httpClient.post<SignupResponse>('/auth/signup', data);
  return response.data;
}

export async function confirmEmail(token: string): Promise<void> {
  await httpClient.post('/auth/confirm-email', { token });
}

export async function resendConfirmation(email: string): Promise<void> {
  await httpClient.post('/auth/resend-confirmation', { email });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await httpClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await httpClient.post('/auth/reset-password', { token, newPassword });
}
