import { describe, it, expect } from 'vitest';
import { TokenBucket } from '../../src/api/rate-limiter.js';

describe('TokenBucket', () => {
  it('初期容量から即座に acquire できる', async () => {
    const bucket = new TokenBucket({ rps: 1 });
    const start = Date.now();
    await bucket.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it('容量超過時は refill を待つ', async () => {
    const bucket = new TokenBucket({ rps: 10, maxBurst: 1 });
    await bucket.acquire();
    const start = Date.now();
    await bucket.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(80); // 10 RPS → 100ms/req
  });

  it('triggerBackoff は指数バックオフスケジュールを返す', () => {
    const bucket = new TokenBucket({ rps: 1 });
    expect(bucket.triggerBackoff()).toBe(30_000);
    expect(bucket.triggerBackoff()).toBe(60_000);
    expect(bucket.triggerBackoff()).toBe(300_000);
    expect(bucket.triggerBackoff()).toBe(1_800_000);
    // 上限を超えたら最大値を維持
    expect(bucket.triggerBackoff()).toBe(1_800_000);
  });

  it('resetBackoff でリセットされる', () => {
    const bucket = new TokenBucket({ rps: 1 });
    bucket.triggerBackoff();
    bucket.triggerBackoff();
    bucket.resetBackoff();
    expect(bucket.triggerBackoff()).toBe(30_000);
  });

  it('getTokens は現在のトークン数を返す', async () => {
    const bucket = new TokenBucket({ rps: 1, maxBurst: 5 });
    expect(bucket.getTokens()).toBeCloseTo(5, 0);
    await bucket.acquire();
    expect(bucket.getTokens()).toBeLessThan(5);
  });
});
