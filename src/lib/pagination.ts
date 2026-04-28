/**
 * MCP cursor-based pagination ↔ 国税庁 divide/divideSize 変換
 * MCP cursor-based pagination ↔ NTA divide/divideSize translation
 *
 * 根拠 / Source:
 *   MCP 公式仕様 server/utilities/pagination (opaque cursor string)
 *   国税庁仕様書 第二編 §3.5, §4.5 (2000件超過時に divide 1-99999 で分割)
 */

interface CursorPayload {
  divide: number;
  /** 元クエリのハッシュ (cursor が他クエリで使い回しされないよう識別子に使う) */
  queryKey?: string;
}

/**
 * 国税庁の分割番号 (divide) + query key を MCP の opaque cursor に encode
 */
export function encodeCursor(divide: number, queryKey?: string): string {
  const payload: CursorPayload = queryKey !== undefined ? { divide, queryKey } : { divide };
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

/**
 * MCP cursor を decode (不正な cursor は null)
 */
export function decodeCursor(cursor: string | undefined): CursorPayload | null {
  if (cursor === undefined || cursor === '') return null;
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'divide' in parsed &&
      typeof (parsed as CursorPayload).divide === 'number' &&
      (parsed as CursorPayload).divide >= 1 &&
      (parsed as CursorPayload).divide <= 99999
    ) {
      return parsed as CursorPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 国税庁レスポンスヘッダ (divideNumber, divideSize) から次のページの cursor を生成
 * Returns null when no more pages (divideNumber >= divideSize)
 */
export function computeNextCursor(
  divideNumber: number,
  divideSize: number,
  queryKey?: string,
): string | null {
  if (divideNumber >= divideSize) return null;
  return encodeCursor(divideNumber + 1, queryKey);
}
