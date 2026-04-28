/**
 * 登記記録の閉鎖等の事由コード辞書
 * Registry closure cause code dictionary
 *
 * 根拠 / Source: 国税庁仕様書 第二編 別紙1 項番26 登記記録の閉鎖等の事由
 */

export const CLOSE_CAUSE_CODES = {
  '01': { ja: '清算の結了等', en: 'Liquidation completed' },
  '11': { ja: '合併による解散等', en: 'Dissolved via merger' },
  '21': { ja: '登記官による閉鎖', en: 'Closed by registrar (Article 81)' },
  '31': {
    ja: 'その他の清算の結了等',
    en: 'Other liquidation (non-registered juridical persons)',
  },
} as const;

export type CloseCauseCode = keyof typeof CLOSE_CAUSE_CODES;

export function isCloseCauseCode(value: string): value is CloseCauseCode {
  return Object.prototype.hasOwnProperty.call(CLOSE_CAUSE_CODES, value);
}

export function closeCauseLabel(code: string, lang: 'ja' | 'en' = 'ja'): string {
  if (code === '' || code === undefined) return '';
  if (isCloseCauseCode(code)) {
    return CLOSE_CAUSE_CODES[code][lang];
  }
  return `unknown(${code})`;
}
