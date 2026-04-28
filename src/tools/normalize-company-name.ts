/**
 * T7: normalize_company_name
 * 国税庁 `target=1` が吸収しきれない 7 パターンの表記揺れを補完
 *
 * 根拠 / Source:
 *   国税庁仕様書 第二編 §4.6.2 (target=1 の内蔵あいまい検索の挙動)
 *   本 MCP の核となる差別化軸
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AttributionSchema, buildAttribution } from '../domain/corporate-number.js';
import { normalizeCompanyName } from '../domain/normalizer.js';

const InputSchema = z
  .object({
    raw_input: z
      .string()
      .min(1)
      .max(500)
      .describe(
        '正規化したい会社名の文字列。名刺OCR結果・手入力・営業リストのセル等、表記揺れを含んでよい。',
      ),
  })
  .strict();

const OutputSchema = z
  .object({
    original: z.string(),
    extracted_core_name: z.string().describe('法人種別を除いたコア社名'),
    normalized_candidates: z
      .array(
        z.object({
          name: z.string().describe('国税庁 API に投げる候補文字列'),
          kind_hint: z.enum([
            'state_agency',
            'local_government',
            'kabushiki_kaisha',
            'yugen_kaisha',
            'gomei_kaisha',
            'goshi_kaisha',
            'godo_kaisha',
            'ippan_shadan_hojin',
            'ippan_zaidan_hojin',
            'koueki_shadan_hojin',
            'koueki_zaidan_hojin',
            'npo_hojin',
            'other_registered',
            'foreign_company',
            'other',
            'unknown',
          ]),
          prefix_or_suffix: z.enum(['mae_kabu', 'ato_kabu', 'none']),
          suggested_target: z
            .enum(['1', '2', '3'])
            .describe(
              '推奨する国税庁 name API の target パラメータ (1=あいまい / 2=完全 / 3=英語)',
            ),
          confidence: z.number().min(0).max(1),
          applied_rules: z.array(z.string()),
        }),
      )
      .max(10),
    fallback_note: z.string().optional(),
    recommendation: z.string().describe('次に呼ぶべき tool とパラメータの推奨'),
    attribution: AttributionSchema,
  })
  .strict();

export type NormalizeCompanyNameOutput = z.infer<typeof OutputSchema>;

const DESCRIPTION = `名刺OCR・手入力・営業リスト等の不完全な会社名から、国税庁 API で検索可能な正規化候補を最大10件生成します。国税庁 API の内蔵あいまい検索 (target=1) が吸収しきれない 7 パターンを補完します:

1. (株)/㈱/株式会社/（株）の表記・位置揺れ (前株・後株・省略の3展開)
2. 法人種別の正規化・分離 (株式/有限/合同/合名/合資/一般社団/特定非営利活動 等)
3. 英語法人名 → 日本語候補 (K.K. / Kabushiki Kaisha / Co.,Ltd. / Inc. / LLC 検出)
4. 半角/全角英数字の正規化 (Unicode NFKC)
5. 旧字体 → 新字体 (髙→高・齋→斎・﨑→崎 等、JIS第一・第二水準縮退補助)
6. 異体字セレクタ (IVS / VS) の除去
7. 空白類の揃え (タブ・連続スペース・全角/半角)

USE THIS WHEN:
- 名刺から抽出した会社名が (株) 表記で、国税庁検索でヒットしない
- 営業リストの会社名に旧字体・異体字・英語表記が混在
- OCR 結果の "(株)スグクル" を "株式会社スグクル" と "スグクル株式会社" の両方で検索したい
- 英語名 "Sugukuru Inc." を日本語検索用と英語検索用 (target=3) の両方の候補にしたい

DO NOT USE WHEN:
- 会社名が既に綺麗に整形されている → search_corporate_by_name を直接使う
- 13桁の法人番号が分かっている → lookup_corporate_by_number
- 単に チェックデジット を検証したい → validate_corporate_number

この tool の出力 normalized_candidates[i].name を search_corporate_by_name.name に、
suggested_target を search_corporate_by_name.search_target に渡す想定です。

注意: 国税庁 target=1 は 「ひらがな↔カタカナ」「英大小文字」「中点・全角空白削除」を自動吸収するため、これらの正規化は本 tool ではスキップされます (重複実装しない方針)。`;

export function registerNormalizeCompanyNameTool(server: McpServer): void {
  server.registerTool(
    'normalize_company_name',
    {
      title: 'Normalize Japanese company name (complements NTA target=1 fuzzy search)',
      description: DESCRIPTION,
      inputSchema: InputSchema.shape,
      outputSchema: OutputSchema.shape,
      annotations: {
        title: 'Normalize Japanese company name',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const input = InputSchema.parse(args);
      const result = normalizeCompanyName(input.raw_input);

      const topCandidate = result.normalized_candidates[0];
      const recommendation =
        topCandidate !== undefined
          ? `次に search_corporate_by_name を呼び、name="${topCandidate.name}" と search_target="${targetLabel(topCandidate.suggested_target)}" を指定してください。複数候補で試す場合は confidence 順に検索してください。`
          : '正規化候補が生成されませんでした。入力を見直してください。';

      const output: NormalizeCompanyNameOutput = {
        original: result.original,
        extracted_core_name: result.extracted_core_name,
        normalized_candidates: result.normalized_candidates,
        ...(result.fallback_note !== undefined && { fallback_note: result.fallback_note }),
        recommendation,
        attribution: buildAttribution(),
      };

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

function targetLabel(target: '1' | '2' | '3'): 'fuzzy' | 'exact' | 'english' {
  if (target === '1') return 'fuzzy';
  if (target === '2') return 'exact';
  return 'english';
}
