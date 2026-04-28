# ADR 0008: Use `@modelcontextprotocol/sdk` v1.x (Tier 1)

Date: 2026-04-29

## Status

Accepted

## Context

MCP は 2026年2月に SDK Tiering System を発表。Tier 1 (100% conformance) / Tier 2 (80%) / Tier 3 (no minimum) の3段階。本プロジェクトはどの SDK を使うか。

## Decision

**`@modelcontextprotocol/sdk` v1.x (Tier 1, Anthropic 公式) を採用する。v2 は Q1 2026 alpha で本番未推奨のため採用しない。**

## Consequences

### Positive

- 100% 仕様準拠保証 → Anthropic Directory 審査に確実に通る
- 公式ドキュメント・サンプル・コミュニティサポートが豊富
- Critical bug resolution 7日以内保証
- v1.x は v2 ship 後 6ヶ月以上保守継続される

### Negative

- v2 の改善 (enterprise ergonomics, Skills, Tasks 安定化) を即享受できない → v0.5.0 で移行評価
- v1.x と v2 の API は breaking change あり → v1.0.0 で v2 stable を検討

## 移行計画

- v0.5.0: v2 stable を評価、互換性調査
- v1.0.0: 必要に応じて v2 への移行判断、semver で breaking change を明示

## References

- MCP SDK Tiering System: `community/sdk-tiers`
- MCP TypeScript SDK GitHub: https://github.com/modelcontextprotocol/typescript-sdk
