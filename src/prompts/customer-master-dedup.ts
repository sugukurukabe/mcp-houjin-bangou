/**
 * Prompt: customer-master-dedup
 *
 * 顧客マスタの重複検知と法人番号による名寄せワークフロー。
 * 表記揺れのある会社名エントリが同一法人であるかを判定。
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const argsSchema = z.object({
  records: z
    .string()
    .min(1)
    .max(15000)
    .describe(
      'JSON Lines (JSONL) 形式の顧客レコード。各行: {"id":"...","name":"...","address":"..."}',
    ),
  dedup_criteria: z
    .enum(['strict_corporate_number', 'fuzzy_name_address', 'conservative_flag_only'])
    .default('strict_corporate_number')
    .describe(
      'strict_corporate_number=同じ法人番号のみ重複判定 / fuzzy_name_address=名寄せ+住所一致で重複判定 / conservative_flag_only=疑わしきは削除しない',
    ),
});

export function registerCustomerMasterDedupPrompt(server: McpServer): void {
  server.registerPrompt(
    'customer-master-dedup',
    {
      title: 'Customer master dedup via NTA corporate number',
      description:
        '顧客マスタの重複検知: T7 で表記揺れを吸収し、国税庁法人番号で名寄せ。マージ推奨ペアを提示。',
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
              text: `以下の顧客レコード (JSONL) の重複を検知し、マージ推奨ペアを提示してください。

【顧客レコード】
"""
${parsed.records}
"""

【重複判定基準】
${parsed.dedup_criteria}

【実行手順】

1. 各レコードから会社名 (name) を抽出
2. normalize_company_name で正規化候補を生成
3. search_corporate_by_name で上位候補を国税庁照会、法人番号 (corporate_number) を取得
4. ${
                parsed.dedup_criteria === 'strict_corporate_number'
                  ? 'SAME corporate_number を持つレコード群を「確定重複」として扱う'
                  : parsed.dedup_criteria === 'fuzzy_name_address'
                    ? '法人番号 一致 OR 正規化名 + 住所一致 を重複候補とする'
                    : '法人番号 一致のみ重複扱い、それ以外は "要確認" として残す'
              }
5. 以下を出力:
   - 重複グループ一覧 (各グループ: レコード ID 配列 + 確定法人番号 + マージ推奨の主レコード)
   - 特定できなかったレコード (国税庁に該当なし)
   - 国税庁情報と乖離があるレコード (住所変更歴ありの可能性)
6. 必ず出典 (attribution.data_source + service_disclaimer) を末尾に明示

【マージ推奨ルール】

- 最も情報量の多いレコード (メール・電話・住所が揃っている) を主レコードに
- 国税庁の正式表記を正とする
- 旧登記住所があれば「履歴」として保持、現行は国税庁の最新で上書き
- LLM が判断に迷ったら "HUMAN_REVIEW_REQUIRED" フラグを立てる (勝手にマージしない)

【Human-in-the-Loop】
本システムは重複を提案するのみで、実際のマージはユーザーの承認を得てから実施してください。誤マージは顧客データの損失につながる可能性があります。

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
