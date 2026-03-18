import { httpClient } from '@/services/http-client';
import type { Member } from './organizations.types';

export async function listMembers(orgId: string): Promise<Member[]> {
  const response = await httpClient.get<{ members: Member[] }>(`/organizations/${orgId}/members`);
  return response.data.members;
}
