# Getting Started / クイックスタート / Panduan Memulai

## 1. 国税庁アプリケーション ID を取得

**必須**: 本 MCP サーバを動かすには、国税庁の Web-API アプリケーション ID が必要です。

1. 下記 URL にアクセス
    https://www.invoice-kohyo.nta.go.jp/web-api/pre-reg/
2. メールアドレスを入力・送信
3. 届いたメールの URL をクリック、届出情報を入力
4. 数営業日以内に ID (13桁) がメールで届きます
5. 完全無料、添付書類・手数料不要 (国税庁仕様書 第一編 §5.1)

**Tip**: 同じ ID で **適格請求書発行事業者 Web-API** も利用できます (v0.3.0 でサポート予定)。

## 2. 動作環境

- **Node.js**: 20.11.1 以上 (`.nvmrc` で固定)
- **pnpm**: 9 以上 (推奨、npm/yarn でも可)
- **MCP Host**: Claude Desktop / Cursor / VS Code Copilot / Goose / MCPJam 等

## 3. インストール方法

### Option A: npx (ゼロインストール、推奨)

```bash
NTA_APPLICATION_ID=your-id-here npx -y @sugukuru-labs/mcp-houjin-bangou
```

### Option B: セルフホスト

```bash
git clone https://github.com/sugukuru-labs/mcp-houjin-bangou.git
cd mcp-houjin-bangou
pnpm install
cp .env.example .env
# .env の NTA_APPLICATION_ID を設定
pnpm build
pnpm start
```

## 4. Claude Desktop 設定

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) を編集:

```json
{
  "mcpServers": {
    "houjin-bangou": {
      "command": "npx",
      "args": ["-y", "@sugukuru-labs/mcp-houjin-bangou"],
      "env": {
        "NTA_APPLICATION_ID": "YOUR_ID_HERE"
      }
    }
  }
}
```

Claude Desktop を再起動。

## 5. Cursor 設定

`~/.cursor/mcp.json` を編集:

```json
{
  "mcpServers": {
    "houjin-bangou": {
      "command": "npx",
      "args": ["-y", "@sugukuru-labs/mcp-houjin-bangou"],
      "env": {
        "NTA_APPLICATION_ID": "YOUR_ID_HERE"
      }
    }
  }
}
```

Cursor を再起動 (または設定の "MCP Servers" から Reload)。

## 6. 動作確認 — 5 つの prompt を試す

### 本番 API 接続確認

アプリケーション ID 取得後、まず live smoke を実行してください。ID は表示されません。

```bash
NTA_APPLICATION_ID=your-id pnpm smoke:live
```

成功すると `/4/num` と `/4/name` の両方が確認されます。
live smoke では、仕様書サンプル番号ではなく、本番 API で実在する法人番号 `7000012050002` を使います。

Claude Desktop または Cursor で:

### UC-1: 法人番号で検索

> 株式会社スグクルの法人番号 5111101000006 について、本店所在地・登記日・法人種別を教えてください。

→ `lookup_corporate_by_number` が実行され、国税庁のデータが返る。

### UC-2: 法人名で検索

> 鹿児島県の「スグクル」で始まる法人を検索してください。結果をテーブルで表示してください。

→ `search_corporate_by_name` + prefecture=46 フィルタ。

### UC-3: 名刺から正規化 → 検索

> 「（株）高橋商事」という名刺に書かれた会社名から、正規化候補を作って国税庁で検索し、法人番号・本店住所・登記年月日を教えてください。表記揺れ (髙橋 / 高橋 / 株式会社高橋商事 / 高橋商事株式会社) すべて試してください。

→ `normalize_company_name` → `search_corporate_by_name` の連続呼出。

### UC-4: チェックデジット検証 (API 不要)

> 法人番号 1340001023456 は有効な番号ですか？チェックデジットだけ確認してください（API は叩かずに）。

→ `validate_corporate_number` がローカルで検証、国税庁 API を一切呼ばない。

### UC-5: 出典文取得

> 本 MCP から取得した情報を自社のレポートに載せる際、国税庁への出典としてどう書けばよいですか？

→ `get_attribution` が Web-API 機能利用規約 別添1 第6条 準拠の文言を返す。

## 7. トラブルシューティング

[`docs/troubleshooting.md`](troubleshooting.md) を参照。

## 8. 次のステップ

- 本リポジトリの [README.ja.md](../README.ja.md) で機能一覧を確認
- [architecture.md](architecture.md) で内部構造を把握
- [ADR 0001-0010](adr/) で設計判断の根拠を確認
- セキュリティ設計は [prompt-injection-defense.md](security/prompt-injection-defense.md)
