/**
 * Prompt: business-card-to-database
 *
 * 名刺 OCR テキストから国税庁公表データを参照して正確な法人情報を引き出し、
 * 構造化レコードとして新規取引先登録に使える形にするワークフロー。
 *
 * 根拠 / Source: MCP 公式仕様 (Prompts primitive)
 *   user-controlled、LLM 側で「ツールを順番に呼び出す」ガイダンスを提供
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const argsSchema = z.object({
  raw_business_card_text: z
    .string()
    .min(1)
    .max(5000)
    .describe('名刺の OCR 結果、または手入力テキスト。会社名・住所・氏名・役職等を含む'),
  target_database_format: z
    .enum(['crm_json', 'salesforce_csv', 'hubspot_properties', 'plain_summary'])
    .default('plain_summary')
    .describe('最終出力フォーマット'),
});

export function registerBusinessCardToDatabasePrompt(server: McpServer): void {
  server.registerPrompt(
    'business-card-to-database',
    {
      title: 'Business card OCR → Normalized → NTA lookup → CRM record',
      description:
        '名刺 OCR テキストから会社名を抽出し、表記揺れを正規化、国税庁公表サイトで法人番号と本店所在地を確認、最後に CRM 登録用レコードに変換するワークフロー。',
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
              text: `次の名刺テキストから会社名を抽出し、国税庁公表サイトで確認して ${parsed.target_database_format} フォーマットで出力してください。

【名刺テキスト】
"""
${parsed.raw_business_card_text}
"""

【実行手順】

1. 名刺テキストから会社名部分を抽出
2. normalize_company_name tool を呼び出し、raw_input に抽出した会社名を渡して正規化候補を取得
3. 正規化候補を confidence 降順で順に search_corporate_by_name tool を呼ぶ (name に候補, search_target に候補の suggested_target)
4. 住所情報 (都道府県名) が名刺に含まれていれば prefecture フィルタを追加
5. 最初にヒットした法人について lookup_corporate_by_number tool で詳細を確認
6. 以下を含むレコードを ${parsed.target_database_format} フォーマットで提示:
   - 法人番号 (13桁)
   - 商号又は名称 (国税庁の正式表記)
   - 本店所在地 (都道府県 + 市区町村 + 丁目番地)
   - 郵便番号
   - 法人種別 (株式会社・有限会社等)
   - フリガナ (ある場合)
   - 英語表記 (ある場合)
   - 登記年月日 (assignment_date)
   - 名刺に書かれていた氏名・役職・メールアドレス・電話番号
7. 必ず出典 (attribution.data_source + service_disclaimer) を最後に記載

【注意】
- 複数候補がヒットした場合は、住所・業種情報から推定して最尤候補を選択、他候補もオプションとして提示
- 確信が持てない場合は「要確認」とマークして、ユーザーに選択肢を提示
- 検索対象除外 (hihyoji=1) の法人は、登記上存在しない住所の可能性があるため明示
- 登記記録閉鎖済み (close_date が空でない) の法人は注意喚起

【出典ルール】
取得したデータは以下の出典付きで返してください:

- data_source: 国税庁法人番号公表サイト (https://www.houjin-bangou.nta.go.jp/)
- service_disclaimer: このサービスは、国税庁法人番号システム Web-API 機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない。
- license: 公共データ利用規約 第1.0版
`,
            },
          },
        ],
      };
    },
  );
}
