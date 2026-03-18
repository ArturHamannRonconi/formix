import { httpClient } from '@/services/http-client';
import type { Member } from './organizations.types';

export async function listMembers(orgId: string): Promise<Member[]> {
  const response = await httpClient.get<{ members: Member[] }>(`/organizations/${orgId}/members`);
  return response.data.members;
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  await httpClient.delete(`/organizations/${orgId}/members/${userId}`);
}
