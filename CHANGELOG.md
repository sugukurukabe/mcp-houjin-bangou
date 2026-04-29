# Changelog

All notable changes to this project will be documented in this file.
本プロジェクトの変更履歴。`Keep a Changelog` 形式、`Semantic Versioning` 準拠。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (v0.1.1 quality hardening)

- `fast-check` property-based tests
  - `tests/unit/check-digit.property.test.ts`: 5 properties, 4000 generated cases
  - `tests/unit/invoice-number.property.test.ts`: 4 properties, 2500 generated cases
  - `tests/unit/normalizer.property.test.ts`: 5 properties, 5000 generated cases
- `tinybench` benchmark suite (`pnpm bench`)
  - check digit validation
  - invoice number normalization
  - company name normalization
  - NTA CSV parser
- Release readiness audit fixes
  - Server Card and runtime `initialize` capability alignment (`listChanged=true`)
  - npm Trusted Publishing / GitHub OIDC (removed `NPM_TOKEN` dependency)
  - CycloneDX SBOM workflow

### Added (v0.3.0 準備層)

- `src/domain/invoice-number.ts`: T番号 (T+13桁) Branded type + 正規化検証 (全角/半角/ハイフン/小文字T 対応)
- `src/domain/invoice-codes.ts`: 事業者処理区分 (01/02/03/04/99) + 人格区分 (1/2) + 国内外区分 (1/2/3) + 応答形式 (01/11/21) の辞書
- `tests/unit/invoice-number.test.ts`: 18 ケース
- `docs/adr/0012-invoice-api-integration.md`: 適格請求書発行事業者 Web-API 統合計画 (Ver.1.0 仕様差異マトリクス含む)
- `docs/deployment/nta-application-response.md`: 国税庁 アプリケーションID 発行申請の返信ガイド (Option A/B)
- `docs/deployment/excel-application-fields.md`: Excel 申請書の完全な埋め込み案
- `docs/deployment/email-template-option-a.md`: メール返信テンプレート (Option A)

## [0.1.0] - 2026-05-22

### Added

- **MCP 公式 7 機能すべて活性化** (Tools / Prompts / Resources / Resource Templates / Completion / Logging / Pagination)
- 5 MCP Tools
  - `lookup_corporate_by_number` (T1): 13桁の法人番号で検索 (国税庁 `/4/num` API、最大10件)
  - `search_corporate_by_name` (T2): 法人名で検索 (国税庁 `/4/name` API、ページング対応)
  - `validate_corporate_number` (T3): チェックデジット検証 (ローカル計算、API 不要)
  - `get_attribution` (T6): 政府標準出典文（公共データ利用規約 第1.0版 + Web-API 機能利用規約 別添1 第6条）
  - `normalize_company_name` (T7): 国税庁 `target=1` 未対応の7パターン表記揺れ補完
- 3 MCP Prompts (v0.2.0 予定から前倒し、ADR-0011)
  - `business-card-to-database`: 名刺OCR → 正規化 → NTA照会 → CRM レコード
  - `sales-list-enrichment`: 営業リスト一括 enrichment
  - `customer-master-dedup`: 顧客マスタ重複検知・名寄せ
- MCP Resources + Resource Templates (`corp://{corporate_number}`, `attribution://houjin-bangou`)
- MCP Completion (`completion/complete` で会社名の auto-complete、T7 駆動 + Prompt 引数の enum 補完)
- MCP Logging (`notifications/message`、RFC 5424 severity、機密情報自動 redact)
- MCP Pagination (opaque cursor、国税庁 `divide`/`divideSize` との変換)
- Server Card at `/.well-known/mcp.json` (SEP-2127 Draft 先行実装)
- Streamable HTTP transport (stateless mode)
- Zod strict schema + `attribution` 必須化 + "When NOT to use" description
- プロンプトインジェクション防御層 (Rug Pull / Tool Shadowing / Tool Poisoning、6 層)
- OpenTelemetry W3C TraceContext 対応 (SEP-414 準備層)
- Application ID redaction + rate limiter (1 RPS + exponential backoff 30s→1m→5m→30m)
- GitHub Actions: ci / release / codeql / dependency-review / api-health-check (週次 keepalive)
- 旧字体→新字体 辞書 45+ パターン (髙/齋/﨑/邉/澤/國/團/寳/應/靑/權/氣/專/單/學/樂/...)
- 3 Prompts 用の動作テストと Completion 補完テスト

### Attribution / 出典

- 国税庁 法人番号 Web-API 機能 Ver.4.0 (政府標準利用規約 = 公共データ利用規約 第1.0版)
- 国税庁法人番号公表サイト (https://www.houjin-bangou.nta.go.jp/)
