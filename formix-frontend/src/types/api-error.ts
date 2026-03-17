import type { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromAxiosError(error: AxiosError<{ message?: string; errors?: string[] }>): ApiError {
    const statusCode = error.response?.status ?? 0;
    const message = error.response?.data?.message ?? error.message;
    const errors = error.response?.data?.errors ?? [];
    return new ApiError(statusCode, message, errors);
  }
}
