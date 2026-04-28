/**
 * 処理区分コード辞書
 * Process division code dictionary
 *
 * 根拠 / Source: 国税庁仕様書 第二編 別紙1 項番9 処理区分
 */

export const PROCESS_CODES = {
  '01': { ja: '新規', en: 'Newly assigned' },
  '11': { ja: '商号又は名称の変更', en: 'Name change' },
  '12': { ja: '国内所在地の変更', en: 'Domestic address change' },
  '13': { ja: '国外所在地の変更', en: 'Foreign address change' },
  '21': { ja: '登記記録の閉鎖等', en: 'Registry closure' },
  '22': { ja: '登記記録の復活等', en: 'Registry revival' },
  '71': { ja: '吸収合併', en: 'Merger by absorption' },
  '72': { ja: '吸収合併無効', en: 'Merger invalidated' },
  '81': { ja: '商号の登記の抹消', en: 'Name registration cancelled' },
  '99': { ja: '削除', en: 'Deleted (duplicate/withdrawal)' },
} as const;

export type ProcessCode = keyof typeof PROCESS_CODES;

export function isProcessCode(value: string): value is ProcessCode {
  return Object.prototype.hasOwnProperty.call(PROCESS_CODES, value);
}

export function processLabel(code: string, lang: 'ja' | 'en' = 'ja'): string {
  if (isProcessCode(code)) {
    return PROCESS_CODES[code][lang];
  }
  return `unknown(${code})`;
}
