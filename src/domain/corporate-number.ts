/**
 * 法人番号の Branded Type + Zod スキーマ
 * Corporate number Branded Type + Zod schema
 * Tipe branded + skema Zod untuk nomor perusahaan
 *
 * 根拠 / Source: 国税庁仕様書 第二編 §2.1.3 (13桁半角数字、チェックデジット付き)
 */

import { z } from 'zod';
import { isValidCheckDigit } from './check-digit.js';

/**
 * 13 桁・チェックデジット検証済の法人番号を表す Branded Type
 * Branded type representing a validated 13-digit corporate number
 */
export const CorporateNumberSchema = z
  .string()
  .regex(/^\d{13}$/, '法人番号は半角数字 13 桁です / Must be 13 half-width digits')
  .refine(isValidCheckDigit, {
    message: 'チェックデジットが一致しません / Check digit mismatch',
  })
  .brand<'CorporateNumber'>();

export type CorporateNumber = z.infer<typeof CorporateNumberSchema>;

/**
 * 政府標準利用規約 + Web-API 利用規約 別添1 第6条 遵守のための出典情報
 * Attribution field required by NTA Web-API Terms Article 6 and 公共データ利用規約 第1.0版
 *
 * 根拠: 国税庁仕様書 第一編 別添1 第6条・別添3 公共データ利用規約 第1.0版
 */
export const AttributionSchema = z.object({
  data_source: z
    .string()
    .describe('データ出典 / Data source / Sumber data (公共データ利用規約 第1.0版 に基づく)'),
  service_disclaimer: z
    .string()
    .describe(
      '利用規約別添1 第6条で求められる指定文言 / Required disclaimer per Article 6 of NTA Web-API ToS',
    ),
  license: z.literal('公共データ利用規約 第1.0版').describe('ライセンス / License'),
  api_version: z.literal('Ver.4.0').describe('国税庁 Web-API バージョン'),
  accessed_at: z.string().describe('アクセス日時 / Accessed at (ISO 8601)'),
});

export type Attribution = z.infer<typeof AttributionSchema>;

/**
 * 標準出典文を生成
 * Generate standard attribution record
 */
export function buildAttribution(): Attribution {
  return {
    data_source: '国税庁法人番号公表サイト（国税庁）https://www.houjin-bangou.nta.go.jp/',
    service_disclaimer:
      'このサービスは、国税庁法人番号システム Web-API 機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない。',
    license: '公共データ利用規約 第1.0版',
    api_version: 'Ver.4.0',
    accessed_at: new Date().toISOString(),
  };
}

/**
 * 国税庁レスポンスから MCP 出力形式の法人情報へ変換
 * Canonical internal shape for corporate info
 * 参考: 第二編 別紙1 リソース定義書 (36 項目)
 */
export const CorporationSchema = z.object({
  corporate_number: z.string().describe('法人番号 (13桁)'),
  sequence_number: z.number().int().describe('一連番号 (第二編 項番7)'),
  process: z.string().describe('処理区分 (01=新規 / 11=商号変更 / 12=所在地変更 ...)'),
  correct: z.enum(['0', '1']).describe('訂正区分 (0=訂正以外 / 1=訂正)'),
  update_date: z.string().describe('更新年月日 YYYY-MM-DD'),
  change_date: z.string().describe('変更年月日 YYYY-MM-DD'),
  name: z.string().describe('商号又は名称'),
  name_image_id: z.string().describe('商号イメージID (JIS 第1/2水準外 or 150字超)'),
  kind: z.string().describe('法人種別コード (101/201/301/302/303/304/305/399/401/499)'),
  prefecture_name: z.string().describe('国内所在地 都道府県'),
  city_name: z.string().describe('国内所在地 市区町村'),
  street_number: z.string().describe('国内所在地 丁目番地等'),
  address_image_id: z.string().describe('国内所在地イメージID'),
  prefecture_code: z.string().describe('都道府県コード (JIS X 0401)'),
  city_code: z.string().describe('市区町村コード (JIS X 0402)'),
  post_code: z.string().describe('郵便番号 (7桁)'),
  address_outside: z.string().describe('国外所在地'),
  address_outside_image_id: z.string().describe('国外所在地イメージID'),
  close_date: z.string().describe('登記記録の閉鎖等年月日'),
  close_cause: z.string().describe('登記記録の閉鎖等の事由 (01/11/21/31)'),
  successor_corporate_number: z.string().describe('承継先法人番号'),
  change_cause: z.string().describe('変更事由の詳細'),
  assignment_date: z.string().describe('法人番号指定年月日'),
  latest: z.enum(['0', '1']).describe('最新履歴 (0=過去 / 1=最新)'),
  en_name: z.string().describe('商号又は名称 (英語表記)'),
  en_prefecture_name: z.string().describe('国内所在地 都道府県 (英語表記)'),
  en_city_name: z.string().describe('国内所在地 市区町村丁目番地等 (英語表記)'),
  en_address_outside: z.string().describe('国外所在地 (英語表記)'),
  furigana: z.string().describe('フリガナ (全角カタカナ・長音のみ)'),
  hihyoji: z.enum(['0', '1']).describe('検索対象除外 (0=対象 / 1=除外、Ver.4.0 追加)'),
});

export type Corporation = z.infer<typeof CorporationSchema>;
