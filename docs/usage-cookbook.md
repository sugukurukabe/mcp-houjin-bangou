# Usage Cookbook — 具体的な LLM プロンプト例 10 個

本ドキュメントは、Claude Desktop / Cursor / VS Code Copilot で本 MCP を使って実務の課題を解く具体例集です。

---

## 1. 法人番号が正しいか確認したい (API 呼出なし)

> 法人番号 `5111101000006` は有効ですか？チェックデジットだけでいいのでローカルで確認して。

**使用 tool**: `validate_corporate_number` — ローカル計算のみ、国税庁 API は叩かない。

---

## 2. 法人番号から本店所在地を引く

> 法人番号 `5111101000006` と `4111101000007` の本店所在地を教えて。テーブルにまとめて。

**使用 tool**: `lookup_corporate_by_number` (最大10件カンマ区切りで一括取得可能)

---

## 3. 名刺の会社名から法人番号を特定

> 「（株）高橋商事」という会社の法人番号と本店所在地を調べて。

**実行される呼出**: `normalize_company_name` → `search_corporate_by_name`

LLM は T7 で「(株)高橋商事 / 高橋商事 / 高橋商事株式会社」の3候補を取得、信頼度降順で search を実行。

---

## 4. 表記揺れを正規化するだけ (検索しない)

> 「Sugukuru K.K.」を国税庁の検索で使える日本語表記に変換したい。候補を出して。

**使用 tool**: `normalize_company_name` — 英語法人名サフィックスを検出、`suggested_target="3"` で英語検索を推奨。

---

## 5. 鹿児島の「スグクル」で始まる全法人を探す

> 鹿児島県の「スグクル」で始まる法人を全部教えて。登記閉鎖済みも含めて。

**使用 tool**: `search_corporate_by_name` (`prefecture="46"`, `match_mode="prefix"`, `include_closed=true`)

---

## 6. 営業リスト 50 件を一括 enrich

> 以下の会社名リストを国税庁で調べて、法人番号・正式名称・本店所在地を Markdown テーブルで教えて:
>
> ```
> （株）高橋商事
> 有限会社テスト
> スグクル
> （略、全 50 件）
> ```

**使用 prompt**: `sales-list-enrichment` (引数 `company_names`, `output_format="markdown_table"`)

---

## 7. 顧客マスタの重複を検知

> 以下の顧客レコード (JSONL) を国税庁法人番号で名寄せして、重複グループを提示して:
>
> ```jsonl
> {"id":"C001","name":"(株)高橋商事","address":"鹿児島市..."}
> {"id":"C002","name":"株式会社高橋商事","address":"鹿児島市..."}
> ```

**使用 prompt**: `customer-master-dedup` (引数 `dedup_criteria="strict_corporate_number"`)

---

## 8. インボイス登録番号 (T番号) の現状確認 (v0.3.0 で統合予定)

> 「T1340001023456」は適格請求書発行事業者として有効ですか？

**v0.1.0 の対応**: `validate_corporate_number` で 13 桁部分 (T を除く) の形式検証のみ可能。

**v0.3.0 予定**: `lookup_invoice_issuer` tool を追加、同じアプリケーション ID で 適格請求書発行事業者 Web-API にアクセスして登録状態を確認 (登録年月日・失効情報含む)。

---

## 9. 法人の商号変更履歴を調べる

> 法人番号 `8040001999013` の商号変更履歴を全部教えて。

**使用 tool**: `lookup_corporate_by_number` with `include_history=true`

→ NTA API の `history=1` で変更履歴 (過去の商号・所在地) も含めて取得。

---

## 10. 本 MCP から取得したデータを社内資料に転載するときの出典

> 本 MCP から取得した法人情報を社内資料に転載する際、国税庁への出典はどう書けばよいですか？

**使用 tool**: `get_attribution` with `format="citation"`

→ 「出典: 国税庁法人番号公表サイト（国税庁）https://www.houjin-bangou.nta.go.jp/」形式の引用文を生成。

加工利用する場合は「加工して作成」の旨も併記 (別添3 公共データ利用規約 第1.0版)。

---

## Tips

### Prompt vs 直接 tool 呼び出し

MCP Prompts (`business-card-to-database` 等) は「ツールを順番に呼ぶ手順」を LLM に構造化して与えるテンプレートです。慣れないうちは Prompt 経由が最も事故が少なく、使い込むと直接ツール呼出しの方がトークン効率が良くなります。

### レート制限に引っかからないために

- 大量の `search_corporate_by_name` を並列実行しない (本 MCP が 1 RPS に抑えていますが、複数プロセスでは抑制不可)
- 営業リスト 50 件以上は分割実行を推奨
- 403 受信時は自動で指数バックオフ (30s → 1m → 5m → 30m)、しばらく待つ

### 3年無利用停止を避ける

アプリケーション ID は 3 年間未使用で停止される可能性があります (第一編 §5.3)。週 1 回 `validate_corporate_number` でも呼べば OK です。本プロジェクトの GitHub Actions に同梱の `api-health-check.yml` を有効化すると自動で維持できます。

### プライバシー・個人情報保護

本 MCP は法人の公開情報のみを扱います (登記公表データ)。自然人の個人情報は扱わず、第一編 別添2 の個人情報保護方針に準拠した設計です。
