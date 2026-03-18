export interface AuthUser {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
