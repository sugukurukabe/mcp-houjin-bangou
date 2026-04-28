/**
 * 法人種別コード辞書
 * Corporate kind code dictionary
 *
 * 根拠 / Source: 国税庁仕様書 第二編 別紙1 項番15 法人種別
 */

export const KIND_CODES = {
  '101': {
    ja: '国の機関',
    en: 'State agency',
    id: 'state_agency',
  },
  '201': {
    ja: '地方公共団体',
    en: 'Local government',
    id: 'local_government',
  },
  '301': {
    ja: '株式会社',
    en: 'Kabushiki Kaisha (Corporation)',
    id: 'kabushiki_kaisha',
  },
  '302': {
    ja: '有限会社（特例有限会社）',
    en: 'Yugen Kaisha (Special LLC)',
    id: 'yugen_kaisha',
  },
  '303': {
    ja: '合名会社',
    en: 'Gomei Kaisha (General partnership)',
    id: 'gomei_kaisha',
  },
  '304': {
    ja: '合資会社',
    en: 'Goshi Kaisha (Limited partnership)',
    id: 'goshi_kaisha',
  },
  '305': {
    ja: '合同会社',
    en: 'Godo Kaisha (LLC)',
    id: 'godo_kaisha',
  },
  '399': {
    ja: 'その他の設立登記法人',
    en: 'Other registered juridical persons',
    id: 'other_registered',
  },
  '401': {
    ja: '外国会社等',
    en: 'Foreign companies etc.',
    id: 'foreign_company',
  },
  '499': {
    ja: 'その他',
    en: 'Other (unincorporated associations etc.)',
    id: 'other',
  },
} as const;

export type KindCode = keyof typeof KIND_CODES;

export function isKindCode(value: string): value is KindCode {
  return Object.prototype.hasOwnProperty.call(KIND_CODES, value);
}

export function kindLabel(code: string, lang: 'ja' | 'en' | 'id' = 'ja'): string {
  if (isKindCode(code)) {
    return KIND_CODES[code][lang];
  }
  return `unknown(${code})`;
}
