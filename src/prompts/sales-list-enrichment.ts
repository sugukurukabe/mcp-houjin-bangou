/**
 * Prompt: sales-list-enrichment
 *
 * 不完全な営業リスト (CSV や Excel) の会社名欄を、
 * 国税庁公表サイトで enrich して完全な法人情報にするワークフロー。
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const argsSchema = z.object({
  company_names: z
    .string()
    .min(1)
    .max(10000)
    .describe('改行区切りの会社名リスト (最大50件推奨、多すぎるとレート制限に抵触)'),
  prefecture_filter: z
    .string()
    .regex(/^(?:\d{2}|\d{5})?$/)
    .optional()
    .describe('絞り込み用の都道府県コード (2桁 or 5桁 JIS)、不要なら省略'),
  output_format: z
    .enum(['markdown_table', 'csv', 'jsonl'])
    .default('markdown_table')
    .describe('出力形式'),
});

export function registerSalesListEnrichmentPrompt(server: McpServer): void {
  server.registerPrompt(
    'sales-list-enrichment',
    {
      title: 'Bulk sales list → NTA enrichment with attribution',
      description:
        '不完全な営業リストの会社名を、国税庁公表サイトで一括 enrich し、正確な法人番号・本店所在地を付加したリストを生成する。',
      argsSchema: argsSchema.shape,
    },
    (args) => {
      const parsed = argsSchema.parse(args);
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `以下の会社名リストを、国税庁公表サイトの情報で enrich してください。

【会社名リスト】
"""
${parsed.company_names}
"""

${
  parsed.prefecture_filter !== undefined && parsed.prefecture_filter !== ''
    ? `【都道府県フィルタ】\nJIS コード: ${parsed.prefecture_filter}\n`
    : ''
}

【実行手順】

1. リストを会社名ごとに分割
2. 各会社名について:
   a. normalize_company_name で正規化候補を取得 (1 件あたり最大 3 秒)
   b. 上位候補 1 つで search_corporate_by_name を叩く
   c. ${parsed.prefecture_filter !== undefined && parsed.prefecture_filter !== '' ? `prefecture=${parsed.prefecture_filter} を適用` : '都道府県フィルタなし'}
   d. 1 件ヒットしたら enrich 成功、複数ヒットは上位1件を採用し「要確認」マーク
   e. 0 件なら第 2 候補で再試行
   f. それでも 0 件なら「未特定」マーク
3. レート制限に配慮し、順次処理 (並列呼出し禁止)
4. ${parsed.output_format} 形式で出力:
   - 入力会社名 / 法人番号 / 正式名称 / 本店所在地 / 法人種別 / ステータス (enrich 成功/要確認/未特定)
5. 末尾に出典情報 (attribution) を必ず記載

【ヒント】
- normalize_company_name の suggested_target を素直に使う
- 結果件数 0 の場合、match_mode を 'partial' にして再試行する価値あり
- include_closed=true (デフォルト) で登記閉鎖済み法人もヒットさせる
- 大量処理で 403 エラーが出たら、本 MCP は自動で 30s→1m→5m→30m の指数バックオフを適用する

【出力例 (markdown_table)】
| 入力 | 法人番号 | 正式名称 | 本店所在地 | 状態 |
|---|---|---|---|---|
| （株）高橋商事 | 1234567890123 | 株式会社高橋商事 | 鹿児島県鹿児島市... | ✅ |
| XYZ商事 | - | - | - | ❌ 未特定 |

出典: 国税庁法人番号公表サイト（国税庁）https://www.houjin-bangou.nta.go.jp/
このサービスは、国税庁法人番号システム Web-API 機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない。
`,
            },
          },
        ],
      };
    },
  );
}
