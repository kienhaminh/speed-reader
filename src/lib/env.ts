import { z } from 'zod';

/**
 * Environment variable schema validation
 * Validates all required and optional environment variables at application startup
 */
const envSchema = z.object({
  // Required variables
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid PostgreSQL URL'),

  GEMINI_API_KEY: z
    .string()
    .min(1, 'GEMINI_API_KEY is required'),

  // Optional variables with defaults
  REDIS_URL: z
    .string()
    .url('REDIS_URL must be a valid Redis URL')
    .optional(),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default(3000)
    .optional(),
});

// Type for validated environment variables
export type Env = z.infer<typeof envSchema>;

/**
 * Validate and return environment variables
 * Throws descriptive error if validation fails
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errors}\n\nPlease check your .env.local file.`
    );
  }

  return result.data;
}

/**
 * Cached validated environment variables
 * Validated lazily on first access to allow test setup
 */
let cachedEnv: Env | null = null;

function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if running in specific environment
 */
export const isProduction = () => getEnv().NODE_ENV === 'production';
export const isDevelopment = () => getEnv().NODE_ENV === 'development';
export const isTest = () => getEnv().NODE_ENV === 'test';

// Export env as a proxy object for backward compatibility
export const env = new Proxy({} as Env, {
  get(target, prop) {
    return getEnv()[prop as keyof Env];
  },
});
