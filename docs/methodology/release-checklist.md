# Release Checklist — v0.1.0 リリース前の 50 項目チェック

本リストは v0.1.0 を「恥ずかしくない公開水準」に到達させるための最終チェック。
各項目は「ある/ない」の 2 値で判定し、ない項目は release 前に必ず埋める。

## Code Quality（10 項目）

- [ ] `pnpm test` が all green（単体 + 統合）
- [ ] `pnpm typecheck` が clean, 0 errors
- [ ] `pnpm lint` が 0 errors（warning は許容）
- [ ] `pnpm format:check` が all formatted
- [ ] `pnpm build` で `dist/` が生成、`dist/server.js` 実行可能
- [ ] `pnpm test:coverage` で 80% 以上
- [ ] Property-based tests が 3 つ以上の domain function でパス（fast-check）
- [ ] Benchmark suite が走り、README にスコアが掲載されている
- [ ] Golden snapshot tests が対象 API 仕様書の全サンプルで pass
- [ ] Mutation testing score (Stryker) が 85% 以上

## MCP 7 Primitives Compliance（7 項目）

- [ ] `initialize` で protocolVersion ネゴシエーション成功
- [ ] `tools/list` で宣言した tool 数が返る
- [ ] `prompts/list` で宣言した prompt 数が返る
- [ ] `resources/list` で静的 resource が返る
- [ ] `resources/templates/list` で resource template が返る
- [ ] `completion/complete` が意味ある候補を返す
- [ ] `logging/setLevel` capability 宣言され、`notifications/message` が emit される

## Server Card（3 項目）

- [ ] `/.well-known/mcp.json` が 200 OK で返る
- [ ] Server Card に全 primitives が列挙されている
- [ ] Server Card に `safety` / `attribution` / `specs_referenced` メタデータ完備

## Security（8 項目）

- [ ] Application ID / secrets の env 読込 & ログ redaction 動作確認
- [ ] Rate limiter が単体テストで PASS
- [ ] 全 Tool output に `attribution` が必須化 (Zod required)
- [ ] 全 Tool description が静的定数、`<IMPORTANT>` 等のメタ命令なし
- [ ] CI に prompt injection grep guard 設置
- [ ] `docs/security/prompt-injection-defense.md` で 6 層防御公開
- [ ] CodeQL weekly scan で 0 High/Critical
- [ ] `pnpm audit signatures` で signed dependencies 確認

## Supply Chain（6 項目）

- [ ] `pnpm-lock.yaml` コミット済み
- [ ] `.github/dependabot.yml` で weekly 更新
- [ ] CycloneDX SBOM が release で artifact 添付される
- [ ] OIDC-based npm trusted publishing 設定済み（NPM_TOKEN 廃止）
- [ ] SLSA L3 provenance が release で自動生成される
- [ ] `package.json` に `files: [dist, README, LICENSE, CHANGELOG]` 制限

## Documentation（13 項目）

- [ ] LICENSE (MIT or Apache-2.0)
- [ ] SECURITY.md (3 言語: ja/en/id)
- [ ] CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- [ ] CONTRIBUTING.md（3 言語ルール + PR ルール）
- [ ] CHANGELOG.md (Keep a Changelog 形式)
- [ ] README.md (英語、30 秒で伝わる構造 + demo GIF)
- [ ] README.ja.md（日本語、完全並列）
- [ ] ADR 0001-0012 (Michael Nygard 形式)
- [ ] `docs/architecture.md`（Mermaid 図付き）
- [ ] `docs/getting-started.md`（5 UC prompt 含む）
- [ ] `docs/troubleshooting.md`
- [ ] `docs/policy/privacy-policy.md` + `terms-of-service.md`
- [ ] `docs/api-reference.md`（全 tool/prompt/resource のスキーマ）

## CI/CD（6 項目）

- [ ] `.github/workflows/ci.yml` (test + lint + typecheck + build + format + security guards)
- [ ] `.github/workflows/release.yml` (provenance 付き npm publish)
- [ ] `.github/workflows/codeql.yml` (weekly)
- [ ] `.github/workflows/dependency-review.yml`
- [ ] `.github/workflows/api-health-check.yml`（週次 keepalive、3 年無利用停止防止）
- [ ] `.github/ISSUE_TEMPLATE/` + `PULL_REQUEST_TEMPLATE.md`

## Publish 準備（4 項目）

- [ ] `package.json` scoped public name（`@org/package`）
- [ ] `.npmignore` で不要ファイル除外
- [ ] `pnpm publish --dry-run --access public` が成功
- [ ] `npm info @org/package` で name conflict なし

## Release 当日（3 項目）

- [ ] `git tag -a v0.1.0 -m "..."` で annotated tag
- [ ] `git push origin main --tags` で release.yml が発火
- [ ] npm レジストリに公開されたことを確認

## Distribution 前段取り（10 項目）

- [ ] 30 秒 Demo GIF が README 最上部
- [ ] Zenn 記事が下書き完成
- [ ] dev.to 英訳が下書き完成
- [ ] X launch thread（日本時間 + US 時間の 2 投稿用）が下書き
- [ ] HN "Show HN" 投稿文が下書き
- [ ] awesome-mcp PR 用の diff を用意
- [ ] 指名レビュー依頼の文面（5 名分）
- [ ] `docs/articles/zenn-v0.1.0.md` が完成版
- [ ] YouTube walkthrough 動画が録画済み or 予定確定
- [ ] 地域 MCP コミュニティ登壇エントリー

## 最終 Sanity Check（3 項目）

- [ ] `curl http://localhost:3001/health` が 200 OK
- [ ] `curl http://localhost:3001/.well-known/mcp.json` が有効 JSON
- [ ] Claude Desktop で UC-1〜UC-5 の全 prompt が実機検証済み（本番 ID 使用）

---

## 一括チェック用コマンド

```bash
# Code quality
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm format:check

# Publish dry-run
pnpm publish --dry-run --no-git-checks --access public

# MCP protocol smoke test
pnpm smoke http://localhost:3001

# Prompt injection CI guard
grep -RInE '<IMPORTANT>|<instruction|<system>|ignore previous|disregard' src/tools/ && exit 1 || echo "OK"
```

すべて OK なら release 可能。

## 本プロジェクトでの達成状況 (v0.1.0-rc.3)

- Code Quality: 10/10 ✅
- MCP 7 Primitives: 7/7 ✅
- Server Card: 3/3 ✅
- Security: 8/8 ✅
- Supply Chain: 3/6（SBOM / OIDC / SLSA L3 は要実装）
- Documentation: 13/13 ✅
- CI/CD: 6/6 ✅
- Publish 準備: 4/4 ✅
- Distribution 前段取り: 4/10（GIF / 動画 / HN / X / awesome-mcp / 指名レビューは未）
- 最終 Sanity: 2/3（本番 ID 審査中）

不足項目の埋め合わせで v0.1.0 公開可能。
