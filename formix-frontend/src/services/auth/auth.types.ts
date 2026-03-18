export interface SignupData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface SignupResponse {
  userId: string;
  organizationId: string;
  accessToken: string;
  emailConfirmationRequired: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  organizationId: string;
  role: string;
}
