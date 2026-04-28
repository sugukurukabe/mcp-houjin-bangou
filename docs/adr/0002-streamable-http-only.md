# ADR 0002: Streamable HTTP transport only (stateless)

Date: 2026-04-29

## Status

Accepted

## Context

MCP は公式に 2 つの transport を提供: STDIO (ローカル) / Streamable HTTP (リモート)。本プロジェクトはどちらを採用するか。

## Decision

**Streamable HTTP transport のみ採用、stateless mode で動作する。STDIO は v0.1.0 では実装しない。**

## Consequences

### Positive

- Anthropic 公式推奨 (SSE は deprecated、Streamable HTTP が 2026年以降の標準)
- Cloud Run / Vercel / Cloudflare Workers どこにでも即乗せ可能
- Transport WG (Dec 2025 blog post) が示した stateless 進化方向と整合
- `sessionIdGenerator: undefined` で stateless、各 POST が独立した session
- 水平スケーリング容易、load balancer の sticky session 不要
- Anthropic Connectors Directory の要件を満たす

### Negative

- STDIO でローカル使用したい Power User には npx 経由で `localhost:3001/mcp` を使わせる必要
- `GET /mcp` や `DELETE /mcp` は 405 Method Not Allowed を返す (stateless 仕様)

## Alternatives Considered

- **STDIO + Streamable HTTP dual**: 実装コスト2倍、v0.1.0 のスコープ外
- **SSE transport**: 既に deprecated。採用しない

## References

- https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/
- MCP 公式仕様 `specification/2025-11-25/basic/transports`
