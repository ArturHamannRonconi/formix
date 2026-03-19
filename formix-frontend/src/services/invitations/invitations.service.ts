import { httpClient } from '@/services/http-client';
import type { Invitation } from './invitations.types';

export async function listInvitations(): Promise<Invitation[]> {
  const response = await httpClient.get<{ invitations: Invitation[] }>('/invitations');
  return response.data.invitations;
}

export async function createInvitation(email: string): Promise<{ invitationId: string }> {
  const response = await httpClient.post<{ invitationId: string }>('/invitations', { email });
  return response.data;
}

export async function resendInvitation(invitationId: string): Promise<void> {
  await httpClient.post(`/invitations/${invitationId}/resend`);
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  await httpClient.delete(`/invitations/${invitationId}`);
}

export async function acceptInvitation(
  token: string,
  data?: { name?: string; password?: string },
): Promise<{ accessToken: string; refreshToken: string; userId: string; organizationId: string }> {
  const response = await httpClient.post('/invitations/accept', { token, ...data });
  return response.data;
}

export async function verifyInvitationToken(token: string): Promise<{ email: string }> {
  const response = await httpClient.get<{ email: string }>(`/invitations/verify?token=${token}`);
  return response.data;
}
