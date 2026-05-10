# Privacy Policy / プライバシーポリシー / Kebijakan Privasi

**Last updated / 最終更新日**: 2026-05-22

## 対象 / Scope

本ポリシーは `@sugukuru/mcp-houjin-bangou` の Hosted 版 (v0.5.0+ 予定) およびリファレンス実装に適用されます。

npx や Docker でユーザー自身の環境で実行する場合、本プロジェクト自体はテレメトリを収集しません (no-op)。

## 収集する情報

### 本プロジェクトが収集する情報

- **なし**。本プロジェクトは opt-in テレメトリを含めて、いかなる利用情報も収集しません。

### 国税庁側が収集する情報 (本プロジェクトの制御外)

- 本プロジェクトは国税庁 法人番号 Web-API にアクセスする際、国税庁側で以下が記録されます (国税庁 別添2 個人情報保護方針):
  - IP アドレス
  - アプリケーション ID
  - アクセス日時
  - その他利用に係る情報
- これらは国税庁の個人情報保護方針 (別添2) に従って取り扱われます。詳細: https://www.houjin-bangou.nta.go.jp/

## アプリケーション ID の取扱

本 OSS をセルフホストする場合、利用者自身が国税庁から ID を取得・管理します。本プロジェクトは ID を収集・送信しません。

Hosted 版 (v0.5.0+) では Sugukuru K.K. が自己の ID で国税庁 API にプロキシアクセスし、エンタープライズ利用者には個別 ID を発行しません (別添1 第9条第1項五号の ID 譲渡禁止に適合)。

## Cookie / セッション

- 本 MCP サーバは stateless (sessionIdGenerator: undefined) で動作し、cookie を使用しません

## 問合せ

- privacy@sugukuru.co.jp
