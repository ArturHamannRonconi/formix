export interface EnvironmentVariables {
  MONGODB_URI: string;
  PORT: number;
  NODE_ENV: string;
  EMAIL_PROVIDER: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  EMAIL_CONFIRMATION_EXPIRES_IN: number;
  PASSWORD_RESET_EXPIRES_IN: number;
  APP_URL: string;
}

export function validateConfig(config: Record<string, unknown>): EnvironmentVariables {
  if (!config.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (!config.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is required');
  }

  return {
    MONGODB_URI: config.MONGODB_URI as string,
    PORT: config.PORT ? Number(config.PORT) : 3001,
    NODE_ENV: (config.NODE_ENV as string) || 'development',
    EMAIL_PROVIDER: (config.EMAIL_PROVIDER as string) || 'console',
    JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: (config.JWT_ACCESS_EXPIRES_IN as string) || '15m',
    JWT_REFRESH_SECRET: (config.JWT_REFRESH_SECRET as string) || 'refresh-secret',
    JWT_REFRESH_EXPIRES_IN: (config.JWT_REFRESH_EXPIRES_IN as string) || '7d',
    EMAIL_CONFIRMATION_EXPIRES_IN: config.EMAIL_CONFIRMATION_EXPIRES_IN
      ? Number(config.EMAIL_CONFIRMATION_EXPIRES_IN)
      : 86400000,
    PASSWORD_RESET_EXPIRES_IN: config.PASSWORD_RESET_EXPIRES_IN
      ? Number(config.PASSWORD_RESET_EXPIRES_IN)
      : 3600000,
    APP_URL: (config.APP_URL as string) || 'http://localhost:3000',
  };
}
