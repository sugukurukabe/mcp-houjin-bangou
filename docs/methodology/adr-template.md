# ADR Template — Michael Nygard 形式 + 必須 12 本

本プロジェクトでは 12 本の ADR を v0.1.0 で書き切った。
新規 MCP プロジェクトでも同じ 12 本を書くことで、判断の一貫性と「Interface Freeze」を担保できる。

## テンプレート

```markdown
# ADR NNNN: [Title]

Date: YYYY-MM-DD

## Status

Draft | Accepted | Deprecated | Superseded by ADR-XXXX

## Context

この判断が必要になった背景。問題の性質、制約、力関係。
複数の選択肢が存在し、どれを選ぶか決める必要がある状態を説明。

## Decision

採用した選択肢を**明確に 1 文で**宣言。曖昧な表現（「検討する」等）は避ける。

**例**: "Streamable HTTP transport のみを採用し、stateless mode で動作する。"

## Consequences

### Positive

この判断のメリット。

### Negative

この判断のデメリット（正直に書く）。

### Neutral

中立的な影響（評価が分かれる点）。

## Alternatives Considered

- **代替案 1**: 説明。却下理由。
- **代替案 2**: 説明。却下理由。

## References

- 対象 API 仕様書の関連節
- MCP 公式仕様の関連章
- 関連 SEP 番号
- 他の ADR との関係
```

## 必須 12 本 — テーマと判断例

### ADR 0001: License

**判断例**: MIT License 採用 (Apache-2.0 比較で判断)

**根拠**:
- 日本の OSS エコシステム (SmartHR / yusukebe/Hono 等) と同じスタンス
- scoped npm package で `--access public` 可能
- downstream が Apache-2.0 に再ライセンス可能

### ADR 0002: Transport 選択

**判断例**: Streamable HTTP only, no stdio

**根拠**:
- Anthropic 公式推奨
- Cloud Run / Vercel / Cloudflare Workers 全対応
- Anthropic Connectors Directory の要件

### ADR 0003: 応答形式選択

**判断例**: 対象 API の複数フォーマット中から 1 つを固定

**根拠**:
- UTF-8 で Node.js fetch と自然に相性が良い
- 対象 API が対応する最高水準の JIS 範囲
- パーサーの実装コスト最小

### ADR 0004: Input/Output 検証戦略

**判断例**: Zod `.strict()` (additionalProperties: false) 全 tool で適用

**根拠**:
- SEP-1303 (Input Validation as Tool Execution Errors) 遵守
- Tool Poisoning 攻撃の構造的阻止
- LLM が自己修復可能な構造化エラー

### ADR 0005: 認証方式

**判断例**: v0.1.0 は anonymous public、v0.5.0 で Enterprise-Managed Auth 追加

**根拠**:
- 対象 API が公開情報のみ
- ユーザー側の OAuth 実装負担回避
- v0.5.0 Hosted で Sugukuru エンタープライズ導線

### ADR 0006: Attribution 必須化

**判断例**: 全 tool output に `attribution` フィールドを Zod required 化

**根拠**:
- 対象 API 利用規約の出典明記義務を構造的に強制
- プロンプトインジェクション緩和にも寄与
- Anthropic Directory Policy の "no misleading information" 要件

### ADR 0007: ドメイン固有の差別化判断

**判断例**: 対象 API が内蔵している機能を重複実装しない

**根拠**:
- 仕様書で内蔵あいまい検索を発見
- MCP 設計原則「特異性よりも構成可能性」
- 自プロジェクトのスコープを明確化

### ADR 0008: SDK 選択

**判断例**: `@modelcontextprotocol/sdk` v1.x (Tier 1) 採用

**根拠**:
- SDK Tiering System で Tier 1 (100% conformance)
- v2 は Q1 2026 alpha で本番未推奨

### ADR 0009: Server Card path

**判断例**: `/.well-known/mcp.json` で公開

**根拠**:
- Transport WG (2025-12) 仕様
- SEP-2127 Server Card (Draft) 先行実装
- registry/crawler 発見可能性

### ADR 0010: プロンプトインジェクション防御層

**判断例**: 6 層防御を透明に公開

**根拠**:
- Simon Willison (2025-04) の Rug Pull / Tool Shadowing / Tool Poisoning への対応
- OWASP MCP Security Cheat Sheet 2026
- Read-only 設計を最大の防御として活用

### ADR 0011: Prompts primitive の版管理判断

**判断例**: v0.2.0 予定から v0.1.0 に前倒し

**根拠**:
- MCP 7 機能すべて活性化を初回リリースで達成
- 名刺 OCR ワークフローを目玉ユースケースとして提示可能
- Prompts は Tools を組み合わせるだけで複雑度低い

### ADR 0012: 後続 version の仕様差異計画

**判断例**: v0.3.0 で別 API を統合する計画を前倒しで記録

**根拠**:
- 同一 ID で両 API 使用可能 (利用規約条項)
- 仕様差異マトリクスを事前に整理
- 準備層 (Branded type + コード辞書) を v0.1.0 で先行実装

## ADR を書くタイミング

- 仕様書読み込み完了時（0001-0003 下書き）
- 設計 Plan Mode で議論中（0004-0008 確定）
- 実装開始直前（0009-0012 確定）
- v0.2.0 以降の主要判断毎に 1 本追加

## ADR を書くコツ

1. **Date を必ず入れる**: 将来「いつの判断か」を追跡可能にする
2. **Decision は 1 文で宣言**: 曖昧な表現禁止
3. **Consequences の Negative も正直に書く**: メリットだけ書いたら信頼失う
4. **Alternatives Considered は 2-3 個**: 比較検討した痕跡を残す
5. **References で仕様書の節番号を引用**: 根拠の追跡性を担保

## ADR 連番の管理

- 新規 ADR は `0013` `0014` ... と連番
- 却下された場合 Status を `Rejected`
- 置き換えの場合 `Superseded by ADR-NNNN` を Status に

## ADR が揃っていることのシグナル価値

- コードレビュワーが「なぜこう実装したか」を追跡可能 → PR レビュー高速化
- v0.X.0 → v0.Y.0 の breaking 判断の根拠が残る → Interface Freeze 守れる
- OSS 読者が設計思想を理解可能 → star / contributor 増
- 上級開発者への転職時 → ポートフォリオとして機能
