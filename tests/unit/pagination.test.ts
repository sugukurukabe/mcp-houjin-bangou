import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor, computeNextCursor } from '../../src/lib/pagination.js';

describe('pagination cursor', () => {
  it('encode/decode round-trip', () => {
    const encoded = encodeCursor(3, 'query-hash-abc');
    const decoded = decodeCursor(encoded);
    expect(decoded?.divide).toBe(3);
    expect(decoded?.queryKey).toBe('query-hash-abc');
  });

  it('undefined cursor returns null', () => {
    expect(decodeCursor(undefined)).toBeNull();
    expect(decodeCursor('')).toBeNull();
  });

  it('invalid cursor returns null', () => {
    expect(decodeCursor('not-a-cursor')).toBeNull();
    expect(decodeCursor('!@#$%')).toBeNull();
  });

  it('divide out of range returns null', () => {
    const bad = Buffer.from(JSON.stringify({ divide: 0 })).toString('base64url');
    expect(decodeCursor(bad)).toBeNull();
    const bad2 = Buffer.from(JSON.stringify({ divide: 100000 })).toString('base64url');
    expect(decodeCursor(bad2)).toBeNull();
  });

  it('computeNextCursor null when on last page', () => {
    expect(computeNextCursor(3, 3)).toBeNull();
    expect(computeNextCursor(5, 3)).toBeNull();
  });

  it('computeNextCursor returns next page cursor', () => {
    const next = computeNextCursor(1, 3, 'key');
    expect(next).not.toBeNull();
    const decoded = decodeCursor(next!);
    expect(decoded?.divide).toBe(2);
    expect(decoded?.queryKey).toBe('key');
  });
});
