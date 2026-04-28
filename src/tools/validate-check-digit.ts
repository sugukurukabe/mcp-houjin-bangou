/**
 * T3: validate_corporate_number
 * 法人番号のチェックデジットをローカル検証 (API 呼出なし、レート制限消費なし)
 *
 * 根拠 / Source: 国税庁仕様書 第二編 §2.1.3 (13桁・半角数字・チェックデジット付き)
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AttributionSchema, buildAttribution } from '../domain/corporate-number.js';
import { normalizeAndValidateCorporateNumber } from '../domain/check-digit.js';

const InputSchema = z
  .object({
    corporate_number: z
      .string()
      .min(1)
      .describe(
        '検証する文字列。ハイフン・全角数字・前後の空白は自動正規化されます。例: "1340-00102-3456" や "１３４０００１０２３４５６" も受け付けます。',
      ),
  })
  .strict();

const OutputSchema = z
  .object({
    is_valid: z.boolean(),
    normalized: z
      .string()
      .regex(/^\d{13}$/)
      .nullable()
      .describe('半角13桁に正規化した法人番号。is_valid=false の場合 null。'),
    reason: z.enum([
      'ok',
      'not_13_digits',
      'check_digit_mismatch',
      'invalid_characters',
      'first_digit_zero',
    ]),
    guidance: z.string().describe('エラー時の修正ガイダンス'),
    attribution: AttributionSchema,
  })
  .strict();

export type ValidateCheckDigitInput = z.infer<typeof InputSchema>;
export type ValidateCheckDigitOutput = z.infer<typeof OutputSchema>;

const DESCRIPTION = `法人番号 (13桁) のチェックデジットをローカルで検証します。国税庁 API を叩かないため、レート制限を消費しません。高速・無料・オフライン動作。

USE THIS WHEN:
- 名刺や書類に記載された法人番号が 13桁として妥当かだけ確認したい
- API 呼出なしで事前バリデーションを実施したい (一括処理・フォーム入力検証)
- ハイフン・全角数字・空白を含む文字列を正規化したい

DO NOT USE WHEN:
- 番号から社名・住所を知りたい → lookup_corporate_by_number を使う
- 表記揺れのある会社名から検索したい → search_corporate_by_name

チェックデジット計算式 (国税庁仕様書 第二編 §2.1.3):
  c = 9 - ( Σ_{n=1}^{12} (P_n × Q_n) mod 9 )
  ただし c が 0 のとき c = 9
  P_n: 12桁基礎番号の右から n 桁目
  Q_n: n が偶数なら 1、奇数なら 2`;

export function registerValidateCheckDigitTool(server: McpServer): void {
  server.registerTool(
    'validate_corporate_number',
    {
      title: 'Validate Japanese corporate number check digit (local, no API call)',
      description: DESCRIPTION,
      inputSchema: InputSchema.shape,
      outputSchema: OutputSchema.shape,
      annotations: {
        title: 'Validate Japanese corporate number check digit',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const input = InputSchema.parse(args);
      const result = normalizeAndValidateCorporateNumber(input.corporate_number);

      let output: ValidateCheckDigitOutput;
      if (result.isValid) {
        output = {
          is_valid: true,
          normalized: result.normalized,
          reason: 'ok',
          guidance: '有効な法人番号です / Valid corporate number.',
          attribution: buildAttribution(),
        };
      } else {
        const guidance: Record<typeof result.reason, string> = {
          not_13_digits:
            '法人番号は 13桁の半角数字です。ハイフン・空白は除去されます。入力長を確認してください。',
          check_digit_mismatch:
            'チェックデジットが一致しません。番号の写し間違いの可能性が高いです。原本をご確認ください。',
          invalid_characters:
            '数字以外の文字が含まれています。数字・ハイフン・空白以外を除いてください。',
          first_digit_zero:
            '先頭桁 (チェックデジット) が 0 の法人番号は存在しません。入力をご確認ください。',
        };
        output = {
          is_valid: false,
          normalized: null,
          reason: result.reason,
          guidance: guidance[result.reason],
          attribution: buildAttribution(),
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(output, null, 2),
          },
        ],
        structuredContent: output,
      };
    },
  );
}
