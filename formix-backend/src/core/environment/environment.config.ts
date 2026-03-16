export interface EnvironmentVariables {
  MONGODB_URI: string;
  PORT: number;
  NODE_ENV: string;
  EMAIL_PROVIDER: string;
}

export function validateConfig(config: Record<string, unknown>): EnvironmentVariables {
  if (!config.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  return {
    MONGODB_URI: config.MONGODB_URI as string,
    PORT: config.PORT ? Number(config.PORT) : 3001,
    NODE_ENV: (config.NODE_ENV as string) || 'development',
    EMAIL_PROVIDER: (config.EMAIL_PROVIDER as string) || 'console',
  };
}
