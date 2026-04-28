# Changelog

All notable changes to this project will be documented in this file.
本プロジェクトの変更履歴。`Keep a Changelog` 形式、`Semantic Versioning` 準拠。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-22

### Added

- 5 MCP Tools
  - `lookup_corporate_by_number` (T1): 13桁の法人番号で検索 (国税庁 `/4/num` API、最大10件)
  - `search_corporate_by_name` (T2): 法人名で検索 (国税庁 `/4/name` API、ページング対応)
  - `validate_corporate_number` (T3): チェックデジット検証 (ローカル計算、API 不要)
  - `get_attribution` (T6): 政府標準出典文（公共データ利用規約 第1.0版 + Web-API 機能利用規約 別添1 第6条）
  - `normalize_company_name` (T7): 国税庁 `target=1` 未対応の7パターン表記揺れ補完
- MCP Resources + Resource Templates (`corp://{corporate_number}`)
- MCP Completion (`completion/complete` で会社名の auto-complete、T7 駆動)
- MCP Logging (`notifications/message`、RFC 5424 severity)
- MCP Pagination (cursor-based、国税庁 `divide`/`divideSize` との変換)
- Server Card at `/.well-known/mcp.json` (SEP-2127 Draft 先行実装)
- Streamable HTTP transport (stateless mode)
- Zod strict schema + `attribution` 必須化 + "When NOT to use" description
- プロンプトインジェクション防御層 (Rug Pull / Tool Shadowing / Tool Poisoning)
- Application ID redaction + rate limiter (1 RPS + exponential backoff)
- GitHub Actions: ci / release / codeql / dependency-review / api-health-check

### Attribution / 出典

- 国税庁 法人番号 Web-API 機能 Ver.4.0 (政府標準利用規約 = 公共データ利用規約 第1.0版)
- 国税庁法人番号公表サイト (https://www.houjin-bangou.nta.go.jp/)
