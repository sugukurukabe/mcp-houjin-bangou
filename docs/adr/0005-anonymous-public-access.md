# ADR 0005: Anonymous public access (v0.1.0)

Date: 2026-04-29

## Status

Accepted

## Context

国税庁 法人番号 公表サイト は全て公開情報 (別添3 公共データ利用規約 第1.0版)。MCP サーバーとして OAuth などのユーザー認証を要求すべきか。

## Decision

**v0.1.0 は匿名アクセス (no OAuth, no API key from user) とする。アプリケーション ID は本サーバ所有、利用者に渡さない。**

## Consequences

### Positive

- ユーザー側の OAuth 実装負担なし
- MCP Host (Claude Desktop / Cursor) で即使用可能
- 公開データのみ扱うので個人情報リスクなし
- Sugukuru は自身のアプリケーション ID で国税庁 API にプロキシアクセス

### Negative (v0.5.0 で解消)

- 利用者ごとのアクセス制御なし → v0.5.0 Hosted で Enterprise-Managed Authorization (SEP-990) + OAuth Client Credentials を追加
- 利用者ごとの rate limit なし → v0.5.0 Hosted で Cloud Armor + per-user quota

## v0.5.0 でのエンタープライズ化計画

- **Enterprise-Managed Authorization (ID-JAG, SEP-990 Final)**: Okta / Azure AD からの ID-JAG で集中認証
- **OAuth Client Credentials (RFC 7523 JWT Bearer Assertion)**: CI/CD・機械間アクセス向け
- Sugukuru の ID は社内のみ、利用者は独自 IdP 経由でアクセス (別添1 第9条第1項五号「ID 譲渡・貸与・開示禁止」を遵守)

## References

- SEP-990: Enterprise IdP Policy Controls (Final)
- OAuth Client Credentials Extension: `extensions/auth/oauth-client-credentials`
- 国税庁仕様書 第一編 §5 + 別添1 第4条 (ID 管理)
