# ADR 0009: Server Card at `/.well-known/mcp.json`

Date: 2026-04-29

## Status

Accepted

## Context

Transport WG (Dec 2025) と SEP-2127 Draft が、MCP サーバの metadata discovery のために `/.well-known/*` エンドポイントを提案。具体的パスは仕様策定中。

## Decision

**Server Card は `/.well-known/mcp.json` で公開する。**

- Transport WG blog (2025-12-19) が明示した標準化方向のパス `/.well-known/mcp.json` を採用
- SEP-2127 Server Card (Draft) の先行実装として位置づけ
- 本番仕様確定時は速やかにマイグレーション

## Consequences

### Positive

- 2026 MCP Roadmap "Top 4" の Transport Evolution priority と整合
- registry / crawler からの発見可能性向上
- 事前にサーバ capability を取得可能 (UI hydration 最適化、認証確認)
- プロンプトインジェクション防御: schema hash を記載し改ざん検知に使える

### Negative

- Draft 仕様のため将来破壊的変更あり得る → 本番仕様確定時に追従

## 内容

- `name`, `version`, `protocol_version`, `homepage`
- `transport`: streamable-http / stateless
- `authentication`: anonymous (v0.1.0) / future: OAuth Client Credentials / Enterprise-Managed Auth
- `capabilities`: tools / resources / completions / logging
- `primitives`: tool 名リスト / resource templates
- `attribution`: 国税庁出典
- `maintainer`: Sugukuru K.K.
- `safety`: read_only=true / prompt injection mitigations
- `specs_referenced`: 参照した MCP SEP 群

## References

- https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/
- SEP-2127 Server Card (Draft)
- MCP Server Card Charter: `community/server-card/charter`
