/**
 * 静的 Resource: `attribution://houjin-bangou`
 * 公式出典文を独立したリソースとして公開
 *
 * 根拠 / Source: MCP 公式仕様 (Resources)
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { buildAttribution } from '../domain/corporate-number.js';

const URI = 'attribution://houjin-bangou';

export function registerAttributionResource(server: McpServer): void {
  server.registerResource(
    'attribution',
    URI,
    {
      title: 'Attribution: NTA Corporate Number Publication Site',
      description:
        '国税庁 Web-API 機能利用規約 別添1 第6条 + 公共データ利用規約 第1.0版 に基づく出典情報',
      mimeType: 'application/json',
    },
    async () => {
      const attribution = buildAttribution();
      return {
        contents: [
          {
            uri: URI,
            mimeType: 'application/json',
            text: JSON.stringify(attribution, null, 2),
          },
        ],
      };
    },
  );
}
