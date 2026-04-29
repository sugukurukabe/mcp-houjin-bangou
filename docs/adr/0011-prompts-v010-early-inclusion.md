# ADR 0011: MCP Prompts primitive を v0.1.0 で前倒し導入

Date: 2026-04-29

## Status

Accepted

## Context

当初の計画では MCP Prompts primitive は v0.2.0 で導入予定だった。しかし:

1. 実装完了後に Prompts の追加が 90 分程度で完了することが判明
2. 「MCP 7機能すべて活性化」という差別化軸を v0.1.0 の時点で完全達成できる
3. 名刺 OCR ワークフロー等の目玉ユースケースを初回リリース時点で提示できる

## Decision

**v0.1.0 で Prompts を 3 本同梱する:**

- `business-card-to-database`: 名刺 OCR → 正規化 → NTA照会 → CRM レコード
- `sales-list-enrichment`: 営業リストの一括 enrichment
- `customer-master-dedup`: 顧客マスタの重複検知・名寄せ

## Consequences

### Positive

- **MCP 公式 7 機能すべてを v0.1.0 で活性化** (Tools / Resources / Resource Templates / Prompts / Completion / Logging / Pagination)。比較のためではなく、MCP 仕様に対して誠実な実装にするため
- 名刺 OCR ユースケースを初回リリースで前面に出せ、Zenn 記事での訴求力が増す
- Prompt 経由の使用で LLM のトークン消費が削減される (ツール選択ミス減)
- v0.2.0 で次の目玉 (UI Resources / ext-apps) に集中できる

### Negative

- v0.2.0 の話題が減る → 代わりに UI Resources を v0.2.0 の中心に据える
- Prompts のテキストは国税庁の API 仕様に密結合 → 国税庁仕様変更時に更新負荷

### Neutral

- 当初 v0.2.0 に予定していた「Prompts 3 本」のリリース話題は v0.3.0 (インボイス統合) で補填

## 更新された段階的ロードマップ

| Version | Content |
|---|---|
| **v0.1.0** | 5 Tools + 3 Prompts + Resources + Templates + Completion + Logging + Pagination + Server Card |
| v0.2.0 | UI Resources (ext-apps, corporate-card / search-results) + i18n (ja/en) + Docker image |
| v0.3.0 | 適格請求書発行事業者 API 統合 (T番号対応) |
| v0.5.0 | Hosted + Enterprise-Managed Auth + OAuth Client Credentials + Tasks |
| v1.0.0 | 6-host verification + Anthropic Directory submission + Skills |

## References

- MCP 公式 Prompts 仕様: `specification/2025-11-25/server/prompts`
- `src/prompts/business-card-to-database.ts`
- `src/prompts/sales-list-enrichment.ts`
- `src/prompts/customer-master-dedup.ts`
