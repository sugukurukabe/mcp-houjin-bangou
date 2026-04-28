/**
 * 環境変数の Zod validation
 * Startup-time environment variable validation with Zod
 * Validasi variabel lingkungan saat startup
 */

import { z } from 'zod';

const EnvSchema = z.object({
  NTA_APPLICATION_ID: z
    .string()
    .min(1, 'NTA_APPLICATION_ID is required')
    .describe(
      '国税庁が発行したアプリケーション ID (13桁)。GitHub へのコミット厳禁。第一編 §5.1 参照。',
    ),
  NTA_BASE_URL: z.string().url().default('https://api.houjin-bangou.nta.go.jp/4'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NTA_RATE_LIMIT_RPS: z.coerce.number().positive().default(1),
  NTA_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | undefined;

/**
 * 環境変数を取得 (起動時に一度だけ parse、以降はキャッシュ)
 */
export function getEnv(): Env {
  if (cachedEnv === undefined) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(`Invalid environment variables:\n${issues}`);
    }
    cachedEnv = result.data;
  }
  return cachedEnv;
}

/** テスト専用: 環境変数キャッシュをリセット */
export function resetEnvCache(): void {
  cachedEnv = undefined;
}
