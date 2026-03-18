export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}
