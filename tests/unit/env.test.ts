import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv, resetEnvCache } from '../../src/lib/env.js';

describe('env validation', () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    resetEnvCache();
  });

  afterEach(() => {
    for (const k of Object.keys(process.env)) {
      delete process.env[k];
    }
    Object.assign(process.env, savedEnv);
    resetEnvCache();
  });

  it('NTA_APPLICATION_ID が必須', () => {
    delete process.env['NTA_APPLICATION_ID'];
    expect(() => getEnv()).toThrow(/NTA_APPLICATION_ID/);
  });

  it('デフォルト値が設定される', () => {
    process.env['NTA_APPLICATION_ID'] = 'test-id';
    delete process.env['PORT'];
    delete process.env['LOG_LEVEL'];
    delete process.env['NTA_RATE_LIMIT_RPS'];
    delete process.env['NTA_BASE_URL'];
    const env = getEnv();
    expect(env.PORT).toBe(3001);
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.NTA_RATE_LIMIT_RPS).toBe(1);
    expect(env.NTA_BASE_URL).toBe('https://api.houjin-bangou.nta.go.jp/4');
  });

  it('カスタム PORT を数値化', () => {
    process.env['NTA_APPLICATION_ID'] = 'test-id';
    process.env['PORT'] = '8080';
    const env = getEnv();
    expect(env.PORT).toBe(8080);
  });

  it('不正な LOG_LEVEL を拒否', () => {
    process.env['NTA_APPLICATION_ID'] = 'test-id';
    process.env['LOG_LEVEL'] = 'verbose';
    expect(() => getEnv()).toThrow();
  });
});
