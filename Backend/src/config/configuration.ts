const DEV_JWT_SECRET = 'dev-only-secret-change-before-production';

export interface AppConfiguration {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  corsOrigins: string[];
  databaseUrl: string;
  jwt: {
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    resetExpiresInMinutes: number;
  };
  bcryptRounds: number;
  throttle: {
    ttlMs: number;
    limit: number;
  };
}

function parseCorsOrigins(value?: string): string[] {
  if (!value) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseIntWithFallback(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default (): AppConfiguration => {
  const nodeEnv =
    (process.env.NODE_ENV as AppConfiguration['nodeEnv'] | undefined) ??
    'development';

  return {
    nodeEnv,
    port: parseIntWithFallback(process.env.PORT, 3000),
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
    databaseUrl: process.env.DATABASE_URL ?? '',
    jwt: {
      secret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      resetExpiresInMinutes: parseIntWithFallback(
        process.env.JWT_RESET_EXPIRES_MINUTES,
        15,
      ),
    },
    bcryptRounds: parseIntWithFallback(process.env.BCRYPT_ROUNDS, 10),
    throttle: {
      ttlMs: parseIntWithFallback(process.env.THROTTLE_TTL_MS, 60000),
      limit: parseIntWithFallback(process.env.THROTTLE_LIMIT, 100),
    },
  };
};

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const isProduction = config.NODE_ENV === 'production';
  const required = ['DATABASE_URL'];

  if (isProduction) {
    required.push('JWT_SECRET');
  }

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  if (isProduction && String(config.JWT_SECRET).length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long in production',
    );
  }

  return config;
}
