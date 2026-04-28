/**
 * OpenTelemetry Trace Context (W3C TraceContext) 最小実装
 * Minimal W3C TraceContext propagation (SEP-414 compliant baseline)
 *
 * v0.1.0 では受信側のパースと NTA API への伝搭のみ。
 * v0.5.0 で Cloud Trace exporter 等に展開予定。
 *
 * 根拠 / Source:
 *   W3C TraceContext spec: https://www.w3.org/TR/trace-context/
 *   SEP-414 Final: MCP OpenTelemetry Trace Context Propagation Conventions
 *
 * `traceparent` ヘッダのフォーマット:
 *   version-trace_id-parent_id-flags
 *   例: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */

export interface TraceContext {
  version: string;
  traceId: string;
  parentId: string;
  flags: string;
}

const TRACEPARENT_REGEX = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

export function parseTraceparent(header: string | undefined): TraceContext | null {
  if (header === undefined || header === '') return null;
  const m = TRACEPARENT_REGEX.exec(header.trim().toLowerCase());
  if (m === null) return null;
  const [, version, traceId, parentId, flags] = m;
  if (
    version === undefined ||
    traceId === undefined ||
    parentId === undefined ||
    flags === undefined
  ) {
    return null;
  }
  if (traceId === '0'.repeat(32) || parentId === '0'.repeat(16)) return null;
  return { version, traceId, parentId, flags };
}

export function formatTraceparent(ctx: TraceContext): string {
  return `${ctx.version}-${ctx.traceId}-${ctx.parentId}-${ctx.flags}`;
}

/**
 * 16進数の ID を生成 (lightweight, 暗号学的強度は不要)
 * crypto.randomBytes 相当の精度
 */
export function generateTraceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return bufferToHex(array);
}

export function generateSpanId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return bufferToHex(array);
}

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 親コンテキスト (req.headers.traceparent) から子 span の context を派生
 * Derive child span context from parent context.
 * If parent is null, generate new trace id.
 */
export function deriveChildSpan(parent: TraceContext | null): TraceContext {
  if (parent === null) {
    return {
      version: '00',
      traceId: generateTraceId(),
      parentId: generateSpanId(),
      flags: '01',
    };
  }
  return {
    version: parent.version,
    traceId: parent.traceId,
    parentId: generateSpanId(),
    flags: parent.flags,
  };
}
