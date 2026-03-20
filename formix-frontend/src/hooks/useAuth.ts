'use client';

import { useState, useEffect } from 'react';
import { getAccessToken, clearTokens } from '@/services/auth-token';
import { httpClient } from '@/services/http-client';
import type { AuthUser, AuthState } from '@/types/auth.types';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function useAuth(): AuthState & { logout: () => Promise<void> } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      setIsLoading(false);
      return;
    }

    setUser({
      id: String(payload.sub ?? ''),
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      organizationId: String(payload.organizationId ?? ''),
      role: String(payload.role ?? ''),
    });
    setIsLoading(false);
  }, []);

  async function logout() {
    try {
      await httpClient.post('/auth/logout', {});
    } catch {
      // ignore logout errors — clear tokens regardless
    }
    clearTokens();
    window.location.href = '/login';
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
