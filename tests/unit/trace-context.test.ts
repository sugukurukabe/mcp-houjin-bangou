import { describe, it, expect } from 'vitest';
import {
  parseTraceparent,
  formatTraceparent,
  generateTraceId,
  generateSpanId,
  deriveChildSpan,
} from '../../src/lib/trace-context.js';

describe('parseTraceparent', () => {
  it('valid traceparent', () => {
    const ctx = parseTraceparent('00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01');
    expect(ctx).not.toBeNull();
    expect(ctx?.version).toBe('00');
    expect(ctx?.traceId).toBe('0af7651916cd43dd8448eb211c80319c');
    expect(ctx?.parentId).toBe('b7ad6b7169203331');
    expect(ctx?.flags).toBe('01');
  });

  it('uppercase normalized to lowercase', () => {
    const ctx = parseTraceparent('00-0AF7651916CD43DD8448EB211C80319C-B7AD6B7169203331-01');
    expect(ctx?.traceId).toBe('0af7651916cd43dd8448eb211c80319c');
  });

  it('invalid format returns null', () => {
    expect(parseTraceparent('invalid')).toBeNull();
    expect(parseTraceparent('')).toBeNull();
    expect(parseTraceparent(undefined)).toBeNull();
    expect(parseTraceparent('00-short-b7ad6b7169203331-01')).toBeNull();
  });

  it('all-zero IDs are rejected', () => {
    expect(parseTraceparent('00-00000000000000000000000000000000-0000000000000000-01')).toBeNull();
  });
});

describe('formatTraceparent', () => {
  it('round-trip', () => {
    const original = '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01';
    const ctx = parseTraceparent(original);
    expect(ctx).not.toBeNull();
    if (ctx !== null) {
      expect(formatTraceparent(ctx)).toBe(original);
    }
  });
});

describe('generateTraceId / generateSpanId', () => {
  it('traceId is 32 lowercase hex', () => {
    const id = generateTraceId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('spanId is 16 lowercase hex', () => {
    const id = generateSpanId();
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('ids are unique', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateTraceId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('deriveChildSpan', () => {
  it('null parent creates new trace', () => {
    const child = deriveChildSpan(null);
    expect(child.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(child.flags).toBe('01');
  });

  it('inherits traceId and flags from parent', () => {
    const parent = parseTraceparent('00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01');
    expect(parent).not.toBeNull();
    if (parent !== null) {
      const child = deriveChildSpan(parent);
      expect(child.traceId).toBe(parent.traceId);
      expect(child.flags).toBe(parent.flags);
      expect(child.parentId).not.toBe(parent.parentId);
    }
  });
});
