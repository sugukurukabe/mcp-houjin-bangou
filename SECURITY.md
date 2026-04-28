# Security Policy / セキュリティポリシー / Kebijakan Keamanan

## 脆弱性の報告 / Reporting Vulnerabilities / Melaporkan Kerentanan

脆弱性を発見した場合は、GitHub の private security advisory もしくは
`security@sugukuru.co.jp` までご連絡ください。

If you discover a security vulnerability, please report it via GitHub's
private security advisory feature, or email `security@sugukuru.co.jp`.

Jika Anda menemukan kerentanan keamanan, silakan laporkan melalui fitur
private security advisory di GitHub, atau email `security@sugukuru.co.jp`.

**脆弱性の公開前連絡をお願いします。72 時間以内に初回応答します。**

## 取扱対象 / In Scope / Dalam Cakupan

- プロンプトインジェクション（Tool Poisoning / Rug Pull / Tool Shadowing）
- 国税庁 API アプリケーション ID のログ出力漏洩
- Streamable HTTP transport での DoS / SSRF
- Zod スキーマ経由の Input Validation バイパス
- レスポンス経由の XSS / HTML インジェクション

## 設計上のセキュリティ前提 / Security Assumptions / Asumsi Keamanan

- 本 MCP サーバは **read-only** で、書込・削除・コマンド実行系 tool を持ちません
- アプリケーション ID は環境変数のみ、tool 引数経由で受け取りません
- すべての tool description は静的定数、ランタイム書換不可
- 国税庁 API レスポンスはすべて `attribution` フィールド付きで返却
- プロンプトインジェクション詳細対策は [`docs/security/prompt-injection-defense.md`](docs/security/prompt-injection-defense.md) 参照

## 国税庁アプリケーション ID の取扱 / NTA Application ID Handling

国税庁「法人番号システム Web-API 機能利用規約」別添1 第9条第1項第5号に基づき、
ID を第三者に譲渡・貸与・開示することは禁止されています。本プロジェクトを
Hosted 版として提供する場合、スグクル株式会社はエンタープライズ利用者に
ID を渡さず、Sugukuru 運用の ID でプロキシする設計を採ります。

Per NTA Web-API Terms Article 9.1.5, Application IDs must not be transferred,
lent, or disclosed to third parties. Sugukuru's hosted edition proxies via its
own ID rather than distributing IDs to enterprise users.

## Supply Chain Security

- `pnpm-lock.yaml` is committed
- Dependabot weekly updates enabled
- GitHub CodeQL enabled
- `npm audit signatures` runs in CI
- All releases use `pnpm publish --provenance` (sigstore-signed)
