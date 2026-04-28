/**
 * T6: get_attribution
 * 国税庁 Web-API 機能利用規約 別添1 第6条 + 公共データ利用規約 第1.0版 の出典文を返却
 *
 * 根拠 / Source:
 *   国税庁仕様書 第一編 別添1 第6条 (情報の取得元の明示義務)
 *   国税庁仕様書 第一編 別添3 公共データ利用規約 第1.0版 (コンテンツ利用)
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AttributionSchema, buildAttribution } from '../domain/corporate-number.js';

const InputSchema = z
  .object({
    format: z
      .enum(['full', 'short', 'citation'])
      .default('full')
      .describe(
        'full=完全版 (全5フィールド), short=1行テキスト, citation=「出典: ...」形式の引用文',
      ),
    language: z.enum(['ja', 'en']).default('ja'),
  })
  .strict();

const OutputSchema = z
  .object({
    attribution: AttributionSchema,
    formatted_text: z.string().describe('format パラメータに応じた整形済み文字列'),
    usage_guidance: z
      .string()
      .describe('本 MCP の結果を下流のサービス・画面で表示する際の出典明示ガイダンス'),
  })
  .strict();

export type GetAttributionOutput = z.infer<typeof OutputSchema>;

const DESCRIPTION = `国税庁法人番号公表サイト (Web-API 機能) の公式出典文を返します。本 MCP サーバーから取得した情報を下流のアプリケーション・ドキュメント・プレゼンテーション等で使用する際の明示必須文言を提供。

USE THIS WHEN:
- MCP から取得した法人情報を自社サービスで表示する前に、正しい出典文を取得したい
- 利用規約遵守のための指定文言を確認したい
- 報告書・プレゼン・Web ページに掲載する際の出典クレジットを生成したい

DO NOT USE WHEN:
- 法人番号や法人名を検索したい → 他の tool を使う (各 tool の出力に既に attribution が含まれる)

根拠:
  - Web-API 機能利用規約 別添1 第6条: 取得情報をもとにしたサービス提供時の指定文言を明示する義務
  - 公共データ利用規約 第1.0版 (別添3): 出典の記載 + 加工時の明示`;

export function registerGetAttributionTool(server: McpServer): void {
  server.registerTool(
    'get_attribution',
    {
      title: 'Get required attribution text for NTA Web-API usage',
      description: DESCRIPTION,
      inputSchema: InputSchema.shape,
      outputSchema: OutputSchema.shape,
      annotations: {
        title: 'Get required attribution text for NTA Web-API usage',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const input = InputSchema.parse(args);
      const attribution = buildAttribution();

      let formattedText: string;
      switch (input.format) {
        case 'full':
          formattedText =
            input.language === 'ja'
              ? [
                  `出典: ${attribution.data_source}`,
                  `免責: ${attribution.service_disclaimer}`,
                  `ライセンス: ${attribution.license}`,
                  `API バージョン: ${attribution.api_version}`,
                  `アクセス日時: ${attribution.accessed_at}`,
                ].join('\n')
              : [
                  `Source: ${attribution.data_source}`,
                  `Disclaimer: ${attribution.service_disclaimer}`,
                  `License: ${attribution.license}`,
                  `API Version: ${attribution.api_version}`,
                  `Accessed At: ${attribution.accessed_at}`,
                ].join('\n');
          break;
        case 'short':
          formattedText =
            input.language === 'ja'
              ? '出典: 国税庁法人番号公表サイト (公共データ利用規約 第1.0版)'
              : 'Source: NTA Corporate Number Publication Site (Japanese Public Data License v1.0)';
          break;
        case 'citation':
          formattedText =
            input.language === 'ja'
              ? `出典: ${attribution.data_source}`
              : `Source: ${attribution.data_source}`;
          break;
      }

      const guidance =
        input.language === 'ja'
          ? [
              '本 MCP の出力を自社サービスで利用する際は、Web-API 機能利用規約 別添1 第6条に基づき',
              'サービスのいずれかの箇所に service_disclaimer の文言を明示してください。',
              'また、公共データ利用規約 第1.0版 別添3 に基づき data_source の出典を記載してください。',
              '加工利用する場合は「○○を加工して作成」と併記してください。',
            ].join(' ')
          : [
              'When using this MCP output in downstream services, per Article 6 of NTA Web-API Terms Annex 1,',
              'display the service_disclaimer text somewhere in your service.',
              'Per Japanese Public Data License v1.0 (Annex 3), cite data_source as the source.',
              'If modified, annotate as "Created by modifying [data_source]".',
            ].join(' ');

      const output: GetAttributionOutput = {
        attribution,
        formatted_text: formattedText,
        usage_guidance: guidance,
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
