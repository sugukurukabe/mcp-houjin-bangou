# @drapt-lab/mcp-houjin-bangou

> **国税庁 法人番号 Web-API を MCP (Model Context Protocol) 経由で使える公式推奨準拠・セキュアなサーバー。**
> MCP 公式 7 機能すべて活性化 + 名刺OCR等の実務データで使える表記揺れ正規化。

[![npm version](https://img.shields.io/npm/v/@drapt-lab/mcp-houjin-bangou.svg)](https://www.npmjs.com/package/@drapt-lab/mcp-houjin-bangou)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🌐 English README: [README.md](README.md)

## これは何か

Claude Desktop / Cursor / VS Code Copilot 等の MCP ホストから、以下が可能になります:

1. **法人番号 (13桁) で検索** — 最大10件カンマ区切り対応
2. **法人名で検索** — 国税庁内蔵の `target=1` あいまい検索 (ひらがな↔カタカナ・英大小・中点削除) を自動活用
3. **表記揺れを正規化** — 国税庁の `target=1` が拾えない 7 パターンを補完
4. **チェックデジット検証** — ローカル計算、API 呼出なし
5. **出典文取得** — 国税庁 Web-API 利用規約別添1 第6条 + 公共データ利用規約 第1.0版 準拠

5 つの Tool すべてが **Resources / Resource Templates / Completion / Logging / Pagination / Server Card** と統合されています。薄い API ラッパーではなく、MCP 公式 primitive に沿った実装として組んでいます。

## クイックスタート

### 1. 国税庁アプリケーション ID を取得

https://www.invoice-kohyo.nta.go.jp/web-api/pre-reg/ から無料で発行されます (メール経由)。

**重要**: 同じ ID で **適格請求書発行事業者公表システム Web-API** も利用可能です (v0.3.0 でサポート予定)。

### 2. Claude Desktop に追加

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "houjin-bangou": {
      "command": "npx",
      "args": ["-y", "@drapt-lab/mcp-houjin-bangou"],
      "env": {
        "NTA_APPLICATION_ID": "あなたのID"
      }
    }
  }
}
```

### 3. Claude Desktop を再起動して試す

本番 ID が届いたら、まずローカルで live smoke を実行してください。

```bash
NTA_APPLICATION_ID=あなたのID pnpm smoke:live
```

ID はログに出力されません。`/4/num` と `/4/name` の両方を確認します。
live smoke では、仕様書サンプル番号ではなく、本番 API で実在する法人番号 `7000012050002` を使います。

> 株式会社スグクルの法人番号 5111101000006 の本店所在地と登記日を教えて

> 「（株）高橋商事」の表記揺れを正規化して、国税庁で全候補を検索して

## Tools 一覧

| Tool | 用途 | API | メモ |
|---|---|---|---|
| `lookup_corporate_by_number` | 法人番号で検索 | NTA `/4/num` | 最大10件カンマ区切り (仕様準拠) |
| `search_corporate_by_name` | 法人名で検索 | NTA `/4/name` | ページング・都道府県・法人種別フィルタ |
| `validate_corporate_number` | チェックデジット検証 | — | ローカル計算、API 呼出なし |
| `normalize_company_name` | 表記揺れ正規化 | — | 国税庁 `target=1` が拾えない 7 パターン補完 |
| `get_attribution` | 出典文取得 | — | 利用規約 別添1 第6条 + 公共データ利用規約 第1.0版 |

## 設計姿勢

### MCP 公式 7 機能すべてを活性化

本プロジェクトは MCP 公式 7 機能を使います:

- **Tools** × 5
- **Prompts** × 3 (`business-card-to-database` / `sales-list-enrichment` / `customer-master-dedup`) — 名刺OCRから CRM 登録、営業リスト一括 enrichment、顧客マスタ重複検知の実務ワークフローをテンプレート化
- **Resources** (`attribution://houjin-bangou`)
- **UI Resources** (`ui://corporate-card/mcp-app.html`, `ui://search-results/mcp-app.html`) — v0.2.0 の表示層準備
- **Resource Templates** (`corp://{corporate_number}` — 法人番号を URI として法人情報取得)
- **Completion** — `株式会社スグク…` まで打った瞬間に T7 normalizer が候補を返す IDE 補完UX、Prompt 引数の enum 補完も対応
- **Logging** — RFC 5424 severity の構造化ログを `notifications/message` で配信
- **Pagination** — 2000件超過時の opaque cursor (国税庁 `divide`/`divideSize` と変換)
- **Server Card** — `/.well-known/mcp.json` で発見可能性 (SEP-2127 Draft + Transport WG Dec 2025)

### 国税庁 `target=1` あいまい検索を尊重

以下の揺れは、**国税庁 API が既に内蔵**している (第二編 §4.6.2):

- ひらがな → カタカナ
- 英小文字 → 英大文字
- 中点 (・) と全角スペースの削除

これらは重複実装しません。代わりに T7 は国税庁が**拾えない** 7 パターンに特化:

1. **(株)/㈱/株式会社/（株）の位置揺れ** — 前株 ↔ 後株 ↔ 省略 の 3 パターン展開
2. **法人種別の正規化・分離** — 株式・有限・合同・合名・合資・一般社団・特定非営利活動 等
3. **英語法人名 → 日本語候補** — K.K. / Kabushiki Kaisha / Co.,Ltd. / Inc. / LLC 検出
4. **半角/全角英数字の正規化** (Unicode NFKC)
5. **旧字体 → 新字体** (髙→高・齋→斎・﨑→崎 等)
6. **異体字セレクタ (IVS) 除去**
7. **空白類の揃え** (タブ・連続スペース・全角/半角)

### セキュリティ First

- **Read-only のみ** — `destructiveHint: false` 全ツール明示
- **アプリケーション ID は環境変数のみ** — ツール引数経由で受け取らない (プロンプトインジェクション防御)
- **ログ redaction** — `id=***`, bearer, PII を自動マスク
- **Rate limit 1 RPS + 指数バックオフ** — 別添1 第9条第1項三号 (短時間大量アクセス禁止) 遵守
- **プロンプトインジェクション防御 6 層** — 詳細は [`docs/security/prompt-injection-defense.md`](docs/security/prompt-injection-defense.md)
- **Supply chain**: `pnpm-lock.yaml` コミット / Dependabot weekly / CodeQL / `pnpm publish --provenance`

### 仕様書に準拠、引用可能

- すべての設計決定に国税庁仕様書 (第一編・第二編・第六編) の節番号で根拠を明示
- MCP 公式仕様 (2025-11-25) + SEP を引用
- `docs/adr/0001-0010.md` が Michael Nygard 形式で主要決定を記録

## ロードマップ

| バージョン | 予定 | 目玉 |
|---|---|---|
| **v0.2.0** | 2026-05 | 5 Tool + MCP 7 機能 + Server Card |
| v0.2.0 | 2026-06 | MCP **Prompts** (名刺→DB / 営業リストenrichment / 顧客マスタ重複) + UI Resources |
| v0.3.0 | 2026-07 | **適格請求書発行事業者 API 統合** (T番号対応、`/num` `/diff` `/valid` 3エンドポイント、CSV/XML/**JSON** 対応) — 同じ ID で利用可、v0.2.0 で T番号 Branded type + 正規化は準備済 (ADR-0012) |
| v0.5.0 | 2026-09 | Hosted 版 + **Enterprise-Managed Authorization** (SEP-990) + **OAuth Client Credentials** + **Tasks** primitive (SEP-1699) |
| v1.0.0 | 2026-10 | 6-host verification + Anthropic Directory submission + Skills 移行検討 |

## ユースケース: 名刺OCR → CRM 自動登録 (v0.2.0 目玉)

```
ステップ 1: ユーザーが名刺 OCR テキストを Claude に貼り付け
ステップ 2: Prompt `business-card-to-database` が以下を実行:
   normalize_company_name(raw_text)
   → search_corporate_by_name(candidates[0])
   → 正確な法人番号・本店住所・法人種別を取得
ステップ 3: LLM が出典付きで CRM レコードを生成
ステップ 4: ユーザーがレビュー & DB 投入 (Human-in-the-Loop)
```

エンタープライズ向けの Document AI 連携・セキュア DB 書込フロー構築は OSS のスコープ外で、スグクル株式会社のプロフェッショナルサービスで対応します。詳細: https://sugukuru.co.jp

## ドキュメント

- [ADR (設計決定記録)](docs/adr/)
- [プロンプトインジェクション防御](docs/security/prompt-injection-defense.md)
- [プライバシーポリシー](docs/policy/privacy-policy.md)
- [利用規約](docs/policy/terms-of-service.md)
- [セキュリティ](SECURITY.md)
- [コントリビュートガイド](CONTRIBUTING.md)
- [行動規範](CODE_OF_CONDUCT.md)

## 検証

本プロジェクトでは、テストとベンチマークも公開インターフェースの一部として扱います。

```bash
pnpm typecheck
pnpm test
pnpm bench
pnpm publish --dry-run --no-git-checks --access public
```

現在のローカル検証スナップショット:

| Check | Result |
|---|---:|
| Unit + integration tests | 154 passing |
| Property-based generated cases | 11,500+ |
| `computeCheckDigit` | 約 18.8M ops/sec |
| `isValidCheckDigit` | 約 10.1M ops/sec |
| `normalizeCompanyName` | 約 344k ops/sec |
| `parseNtaCsv` | 約 389k ops/sec |
| npm dry-run tarball | 250.6 kB / 151 files |

## 出典

本プロジェクトは **国税庁法人番号システム Web-API 機能** を利用しています。

> **このサービスは、国税庁法人番号システム Web-API 機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない。**

出典: **国税庁法人番号公表サイト** (https://www.houjin-bangou.nta.go.jp/)
ライセンス: **公共データ利用規約 第1.0版**
API バージョン: **Ver.4.0**

## ライセンス

MIT © 2026 スグクル株式会社 (鹿児島)

## About スグクル

スグクル株式会社は鹿児島のインドネシア人材特定技能 1 号派遣会社です。人事労務・ビザ申請・農業コンプライアンスの AI 化を進めています。本プロジェクトは **Sugukuru OSS Lab** シリーズの 1 本目です。今後 `mcp-jp-subsidy-hub` (補助金統合 MCP)、`mcp-immigration-ja` (入管手続 MCP) 等をリリース予定。
