# Excel 「発行申請書」 入力完全ガイド

> **対象**: `hakkou-shinseisyo.xlsx` (適格請求書発行事業者公表システム Web-API 機能アプリケーションID発行申請書)
> 根拠: 第一編 1.5版 別紙1

本ドキュメントに従って Excel を埋めてください。各項目の記載要領は第一編 別紙1 の内容に準拠しています。

## 1. 事業概要

| 項番 | 項目名 | 入力内容 |
|---|---|---|
| 1.1 | 利用者区分 | **法人** |
| 1.2 | 氏名又は名称 | スグクル株式会社 |
| 1.3 | 所在地 | 鹿児島県鹿児島市〇〇区〇〇町〇〇番地 (登記上の本店所在地) |
| 1.4 | 事業内容 | インドネシア人特定技能1号人材派遣、および農業人材派遣業務に関連するソフトウェア・AIツールの開発 |
| 1.5 | メールアドレス | engineering@sugukuru.co.jp (※アプリケーションID発行届出フォームで入力したアドレスと同一) |
| 1.6 | アプリケーションID | **申請中** |
| 1.7 | 担当者氏名 | 壁 (かべ) ※法人代表者兼CTO |
| 1.8 | 担当者連絡先 | XXX-XXXX-XXXX (ハイフンなし) |
| 1.9 | 個人情報管理・苦情処理責任者氏名 | 壁 (同上、法人代表者) |
| 1.10 | 個人情報管理・苦情処理責任者連絡先 | XXXXXXXXXXXX (ハイフンなし) |

**注**: 1.3 所在地・1.8/1.10 電話番号は Sugukuru 正式情報で確認してから入力。

## 2. 取得した公表情報を利用するシステムについて

| 項番 | 項目名 | 入力内容 |
|---|---|---|
| 2.1 | プログラム・システム等の名称 | `@drapt-lab/mcp-houjin-bangou` (Model Context Protocol サーバ、MIT License、GitHub 公開予定) |
| 2.2 | 取得した公表情報の利用方法 | Claude Desktop、Cursor、VS Code Copilot などの MCP クライアントから自然言語インターフェースで法人番号・適格請求書発行事業者情報を照会・検証する機能を提供。ユーザはリアルタイムに必要な情報のみを取得し、本サーバには一切保存しない (stateless / read-only 設計)。 |
| 2.3 | ダウンロードファイルの利用有無 | **無し** (Web-API のみ利用。将来の差分同期は Tasks primitive で API 経由実装予定) |

### 2.4 利用者

以下すべてにチェック:

- [x] 2.4.1 顧客
  - [x] 2.4.1.1 一般 (法人)
  - [x] 2.4.1.2 一般 (個人) (個人事業主 = Specified Skilled Worker の派遣先農家等)
  - [x] 2.4.1.3 税理士 (税理士法人含む) (B2B KYC 用途で税理士からの需要想定)
- [x] 2.4.2 自社 (Sugukuru 社内の経理業務)
- [ ] 2.4.3 その他

### 2.5 取得したデータの保存先・保存方法

#### 2.5.1 データの保存先

- [ ] 2.5.1.1 クラウド
- [ ] 2.5.1.2 外部記録媒体
- [ ] 2.5.1.3 その他
- [x] **2.5.1.4 個人情報の保存はない**

**記載要領** (Excel のコメント欄に補記推奨):

> 本 MCP サーバは Streamable HTTP の stateless transport (第一編 §2 準拠) で動作し、各 JSON-RPC リクエストが独立している。国税庁 API から取得した情報は応答時に一度だけメモリ上に存在し、レスポンス後は保持しない。read-only 設計のため書込・削除・保存ロジックを持たない。したがって個人情報 (個人事業主の登録番号・氏名・住所等) は一切保存されない。

#### 2.5.2 データの保存方法

2.5.1.4 にチェックしたため**入力不要**。

### 2.6 取得した公表情報に係る利用者の把握

#### 2.6.1 利用者の情報・取得状況を把握できる

**はい**

#### 2.6.2 把握方法

> 本 MCP サーバは構造化ログ (pino + MCP `notifications/message` RFC 5424 severity) で全てのツール呼出しを記録する。Hosted 版 (v0.5.0 予定) では Cloud Run のアクセスログと Cloud Trace (OpenTelemetry SEP-414 準拠) により、どの利用者 (IdP 認証経由の企業ユーザ) が何時に何を照会したかを追跡可能。セルフホスト版では各利用者の環境内で同等ログが生成される。監査要求時に該当期間のログ抽出が可能。

### 2.7 添付書類 (どちらか一方)

- [x] **2.7.1 プログラムの概要** (後述 PDF を添付)
- [ ] 2.7.2 その他参考資料 (ソフト等パンフレット)

## 3. 誓約事項

全項目に「**はい**」を選択:

| 項番 | 誓約内容 | 回答 |
|---|---|---|
| 3.1 | 利用規約・法令遵守 (個人情報保護法等) | **はい** |
| 3.2 | 利用者への提供方法 (運営方針の目的に反しない) | **はい** |
| 3.3 | 当庁の監査に協力 | **はい** |

**根拠**: 本プロジェクトは `docs/policy/privacy-policy.md` および `docs/policy/terms-of-service.md` で運営方針遵守を明文化、`docs/security/prompt-injection-defense.md` で安全対策を公開、Sugukuru 株式会社本社 (鹿児島) で臨場監査対応可能。

## 4. 法人番号システム Web-API 機能に係るアプリケーションID

| 項番 | 項目名 | 入力内容 | 理由 |
|---|---|---|---|
| 4.1 | 法人番号システム Web-API 機能のみの利用希望の有無 | **はい** | インボイスAPI の審査が通らなかった場合のバックアップとして法人番号API を確保する (第一編 §5.2)。既に v0.1.0 で法人番号API を実装済み、即利用可能。 |

## 2.7.1 プログラムの概要 PDF — 必須項目

提出用の PDF (10MB 以内) に以下を含めてください。本ドキュメントの内容をベースに生成可能です。

### セクション 1. プロジェクト概要

```
- プロジェクト名: @drapt-lab/mcp-houjin-bangou
- バージョン: v0.1.0 (2026-05-22 公開予定)
- ライセンス: MIT License
- 開発主体: スグクル株式会社 (鹿児島県鹿児島市)
- GitHub リポジトリ: https://github.com/sugukurukabe/mcp-houjin-bangou
- 公式サイト: https://sugukuru.co.jp
```

### セクション 2. 目的と機能

```
Model Context Protocol (MCP、Anthropic が策定) のサーバーとして、
法人番号 Web-API 機能 (将来的には適格請求書発行事業者公表システム Web-API 機能も含む) を
Claude Desktop / Cursor / VS Code Copilot 等の MCP クライアントから自然言語で照会可能にする。
```

**提供機能 (v0.1.0 時点)**:

- 5 MCP Tools:
  - `lookup_corporate_by_number`: 13桁の法人番号で検索 (最大10件)
  - `search_corporate_by_name`: 法人名で検索 (前方一致/部分一致、JIS 1-2水準あいまい/1-4水準完全/英語)
  - `validate_corporate_number`: チェックデジット検証 (ローカル計算、API 不要)
  - `normalize_company_name`: 表記揺れ正規化 (国税庁 target=1 が拾えない 7 パターン補完)
  - `get_attribution`: 政府標準出典文の取得 (利用規約 別添1 第6条遵守)
- 3 MCP Prompts (ワークフローテンプレート):
  - `business-card-to-database`: 名刺OCR → 正規化 → 国税庁照会 → CRM登録レコード
  - `sales-list-enrichment`: 営業リストの一括 enrich
  - `customer-master-dedup`: 顧客マスタの重複検知・名寄せ
- Resources: `attribution://houjin-bangou`、Resource Templates: `corp://{corporate_number}`
- Completion: 会社名の IDE 補完 (T7 正規化ロジックを裏で駆動)
- Logging: RFC 5424 severity の構造化ログ
- Server Card: `/.well-known/mcp.json` (Transport WG Dec 2025 仕様、SEP-2127 Draft 先行実装)

**v0.3.0 (2026-07-22 予定) での追加機能**:

- `lookup_invoice_issuer`: T番号 (T+13桁) で適格請求書発行事業者情報を検索
- `verify_invoice_issuer_active`: 登録年月日・取消/失効年月日を含む活性状態の検証
- `lookup_invoice_issuer_at_date`: 判定基準日を指定した過去時点での登録状況照会
- 適格請求書発行事業者公表システム Web-API 機能利用規約 (別添1) および別添2 個人情報保護方針の遵守

### セクション 3. アーキテクチャ図

```
┌─────────────────────────┐
│ MCP Client              │
│ (Claude Desktop等)      │
└───────────┬─────────────┘
            │ POST /mcp (JSON-RPC 2.0)
            ▼
┌─────────────────────────┐
│ Sugukuru MCP Server     │
│ (Node.js 20.19+)        │
│ ├ Streamable HTTP       │
│ ├ 5 MCP Tools           │
│ ├ 3 MCP Prompts         │
│ ├ Resources/Templates   │
│ ├ Completion Handler    │
│ ├ Logging (RFC 5424)    │
│ ├ Rate Limiter (1 RPS)  │
│ └ Application ID env    │
└───────────┬─────────────┘
            │ GET (HTTPS)
            ▼
┌─────────────────────────┐
│ 国税庁 Web-API (Ver.4.0) │
│ + 適格請求書発行事業者    │
│   Web-API (Ver.1.0)     │
│   [v0.3.0で統合]         │
└─────────────────────────┘
```

### セクション 4. セキュリティ設計

**別添1 第9条 (禁止事項) 遵守**:

- 短時間大量アクセス禁止: Token bucket レートリミッタ (1 RPS) + 指数バックオフ (30s→1m→5m→30m)
- ID 譲渡禁止: Hosted 版では Sugukuru がプロキシとして動作し、利用者に ID を渡さない
- 虚偽情報禁止: CI で Tool description の静的検証、不正な入力を Zod strict schema で拒否

**別添1 第11条の3 (セキュリティ対策)**:

- アンチウイルス: 本 MCP サーバは read-only、ファイル実行なし
- OS/ライブラリ脆弱性: Dependabot weekly + CodeQL + `pnpm audit signatures`
- 不正プログラム定義: 依存パッケージは sigstore provenance 検証済み

**プロンプトインジェクション対策**:

6 層防御を `docs/security/prompt-injection-defense.md` で公開:

1. 静的 tool description (CI grep 検査)
2. 静的 tool / prompt / resource 定義 (運用中変更不可。SDK v1 の capability は `listChanged: true`)
3. Zod strict schema (additionalProperties: false)
4. 環境変数経由のみの ID 管理 (tool 引数禁止)
5. ログの自動 redact
6. 全 output に attribution 必須化

### セクション 5. データ管理体制

- **保存先**: 個人情報は一切保存しない (MCP stateless transport、レスポンス後メモリ解放)
- **ログ**: 構造化ログ (pino) のみ、ID は自動マスク
- **監査対応**: Sugukuru 本社 (鹿児島) で実施可能、ログ保管期間は 2 年

### セクション 6. 利用者の範囲

- 顧客 (法人・個人・税理士)
- 自社 (Sugukuru 経理業務)
- その他: なし

### セクション 7. 開発・運用体制

- **開発**: Sugukuru 株式会社 エンジニアリングチーム
- **運用**: Sugukuru 株式会社 (鹿児島本社)
- **コントリビューション**: GitHub 経由でオープン、全 PR は CI 通過 + レビュー必須
- **セキュリティ報告**: security@sugukuru.co.jp または GitHub private security advisory

### セクション 8. 参考資料 URL

- プロジェクトリポジトリ: https://github.com/sugukurukabe/mcp-houjin-bangou
- README (日本語): https://github.com/sugukurukabe/mcp-houjin-bangou/blob/main/README.ja.md
- API Reference: https://github.com/sugukurukabe/mcp-houjin-bangou/blob/main/docs/api-reference.md
- アーキテクチャ: https://github.com/sugukurukabe/mcp-houjin-bangou/blob/main/docs/architecture.md
- プロンプトインジェクション防御: https://github.com/sugukurukabe/mcp-houjin-bangou/blob/main/docs/security/prompt-injection-defense.md
- プライバシー方針: https://github.com/sugukurukabe/mcp-houjin-bangou/blob/main/docs/policy/privacy-policy.md
- 利用規約: https://github.com/sugukurukabe/mcp-houjin-bangou/blob/main/docs/policy/terms-of-service.md

---

## PDF 生成手順の提案

Markdown → PDF 変換は以下が最速:

```bash
# pandoc を使う場合
pandoc excel-application-fields.md docs/architecture.md docs/policy/privacy-policy.md \
  -o houjin-bangou-mcp-program-overview.pdf \
  --pdf-engine=weasyprint \
  --metadata title="@drapt-lab/mcp-houjin-bangou — プログラム概要"

# Chrome/Edge で Markdown プレビューから印刷 (PDF保存) も可
```

最終 PDF サイズを 10MB 以内に収めるため、画像は以下で圧縮推奨:

- Mermaid 図は `.svg` で軽量化
- スクリーンショットは 1200px 以下に縮小

## 送信時のチェックリスト

- [ ] Excel ファイル名を `application-form-sugukuru.xlsx` にリネーム
- [ ] PDF ファイル名を `houjin-bangou-mcp-program-overview.pdf` にリネーム
- [ ] Excel の項番 1.3, 1.8, 1.10 の個人情報を実情報で埋める
- [ ] Excel の項番 1.9, 1.10 の責任者情報を確定
- [ ] PDF サイズを 10MB 以内に収める
- [ ] メール件名: `Re: [国税庁からのお知らせ]アプリケーションID発行申請書のご提出 (スグクル株式会社)`
- [ ] 返信先: `invoice-web-api@nta.go.jp`
- [ ] 送信日: 5月7日(水) 以前 (5月2-4日推奨、土日避ける)
