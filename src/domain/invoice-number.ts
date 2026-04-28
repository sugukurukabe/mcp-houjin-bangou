/**
 * 適格請求書発行事業者 登録番号 (T+13桁) の Branded Type
 * Qualified Invoice Issuer Registration Number (T + 13 digits)
 * Nomor Registrasi Penerbit Invoice Berkualifikasi (T + 13 digit)
 *
 * 根拠 / Source:
 *   国税庁 第二編 1.5版 2.1.3 条件: 登録番号は "T"＋13桁
 *   国税庁 リソース定義書 1.5版 項番8: "T"+9999999999999 (14桁)
 *
 * T の次の 13 桁は法人番号 (法人の場合) または 個人事業主の識別番号 (個人の場合) であり、
 * いずれもチェックデジット計算式は法人番号と同一 (第二編 別紙1 項番8 で定義)。
 *
 * 本ファイルは v0.3.0 のインボイス API 統合時に本格利用されるが、
 * 法人番号ロジックの再利用可能性を担保するため、v0.1.0 で Branded type の骨格を提供する
 * (ADR 0012 の前倒し実装方針)。
 */

import { z } from 'zod';
import { isValidCheckDigit, normalizeAndValidateCorporateNumber } from './check-digit.js';

/**
 * "T" + 13桁の登録番号 (Branded type)
 * Registered number: literal "T" prefix + 13-digit base (check digit + 12-digit basis)
 */
export const InvoiceNumberSchema = z
  .string()
  .regex(/^T\d{13}$/, '登録番号は T + 半角数字13桁です / Must be "T" + 13 half-width digits')
  .refine((s) => isValidCheckDigit(s.slice(1)), {
    message:
      '登録番号のチェックデジットが一致しません (T を除いた 13桁部分) / Invalid check digit on the 13-digit base',
  })
  .brand<'InvoiceNumber'>();

export type InvoiceNumber = z.infer<typeof InvoiceNumberSchema>;

export type InvoiceValidationReason =
  | 'not_prefixed_with_T'
  | 'not_13_digits_after_T'
  | 'check_digit_mismatch'
  | 'invalid_characters'
  | 'first_digit_zero_after_T';

export interface InvoiceValidationOk {
  isValid: true;
  normalized: string;
  corporateNumberPart: string;
}

export interface InvoiceValidationError {
  isValid: false;
  reason: InvoiceValidationReason;
}

export type InvoiceValidationResult = InvoiceValidationOk | InvoiceValidationError;

/**
 * T番号文字列の正規化 + チェックデジット検証
 *
 * 入力は以下を許容:
 * - `T1234567890123` (半角)
 * - `ｔ1234567890123` (全角 t)
 * - `T-1234-5678-90123` (ハイフン区切り)
 * - `Ｔ１２３４５６７８９０１２３` (全角 T + 全角数字)
 *
 * @param raw 検証対象の文字列
 */
export function normalizeAndValidateInvoiceNumber(raw: string): InvoiceValidationResult {
  if (raw.length === 0) {
    return { isValid: false, reason: 'not_prefixed_with_T' };
  }

  // 全角 T/t を半角 T に、全角数字を半角数字に
  const normalizedT = raw
    .replace(/[\uFF34\uFF54]/g, 'T') // Ｔ (U+FF34), ｔ (U+FF54)
    .replace(/^[tT]/, 'T')
    .replace(/[\uFF10-\uFF19]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

  if (!normalizedT.startsWith('T')) {
    return { isValid: false, reason: 'not_prefixed_with_T' };
  }

  const afterT = normalizedT.slice(1);

  // 法人番号と同じ正規化ロジックを 13桁部分に適用
  const cnResult = normalizeAndValidateCorporateNumber(afterT);
  if (!cnResult.isValid) {
    const mapReason: Record<typeof cnResult.reason, InvoiceValidationReason> = {
      not_13_digits: 'not_13_digits_after_T',
      check_digit_mismatch: 'check_digit_mismatch',
      invalid_characters: 'invalid_characters',
      first_digit_zero: 'first_digit_zero_after_T',
    };
    return { isValid: false, reason: mapReason[cnResult.reason] };
  }

  return {
    isValid: true,
    normalized: `T${cnResult.normalized}`,
    corporateNumberPart: cnResult.normalized,
  };
}
