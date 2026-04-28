# Examples / 動作サンプル

## ファイル一覧

- `claude-desktop-config.json` - Claude Desktop 用の mcpServers 設定 + 動作 prompt 5件
- `cursor-mcp.json` - Cursor 用の設定

## 動作 Prompts (UC-1〜UC-5)

### UC-1: 法人番号で検索

> 株式会社スグクルの法人番号 5111101000006 について、本店所在地・登記日・法人種別を教えてください。

使用ツール: `lookup_corporate_by_number`

### UC-2: 法人名で検索

> 鹿児島県の「スグクル」で始まる法人を検索してください。結果をテーブルで表示してください。

使用ツール: `search_corporate_by_name` (prefecture=46 を自動判定)

### UC-3: 名刺 OCR → 正規化 → 検索

> 「（株）高橋商事」という名刺に書かれた会社名から、正規化候補を作って国税庁で検索し、法人番号・本店住所・登記年月日を教えてください。

使用ツール: `normalize_company_name` → `search_corporate_by_name`

### UC-4: チェックデジット検証 (API不要)

> 法人番号 1340001023456 は有効な番号ですか？チェックデジットだけ確認してください（API は叩かずに）。

使用ツール: `validate_corporate_number`

### UC-5: 出典文取得

> 本 MCP から取得した情報を自社のレポートに載せる際、国税庁への出典としてどう書けばよいですか？

使用ツール: `get_attribution`

## セットアップ / Setup

1. 国税庁アプリケーション ID を取得: https://www.invoice-kohyo.nta.go.jp/web-api/pre-reg/
2. `claude-desktop-config.json` の `<YOUR_NTA_APPLICATION_ID...>` を取得した ID に置換
3. Claude Desktop の設定 (`~/Library/Application Support/Claude/claude_desktop_config.json`) にコピー
4. Claude Desktop を再起動
5. 上記 UC-1〜UC-5 の prompt を試す
