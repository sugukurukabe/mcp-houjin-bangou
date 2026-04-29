# ADR 0013: v0.2.0 UI Resources の下準備を v0.1.1 で導入

Date: 2026-04-29

## Status

Accepted

## Context

v0.2.0 では MCP Apps / UI Resources による `corporate-card` と `search-results` の表示を予定している。UI を完全に tool metadata に接続する前に、Vite single-file build、CSP hash 注入、`ui://` resource 登録を先に固める必要がある。

## Decision

**v0.1.1 で UI Resources の build pipeline と read-only resource 登録だけを先行導入する。**

追加するもの:

- `src/ui/corporate-card/`
- `src/ui/search-results/`
- `vite.config.ts`
- `scripts/compute-csp-hashes.ts`
- `src/resources/ui-resources.ts`
- `ui://corporate-card/mcp-app.html`
- `ui://search-results/mcp-app.html`

ただし v0.1.1 では `lookup_corporate_by_number` / `search_corporate_by_name` の `_meta.ui.resourceUri` 接続は行わない。tool 実行結果の表示 UI として安全に読める状態までを下準備とする。

## Consequences

### Positive

- v0.2.0 で UI tool metadata を接続するだけで済む
- Vite single-file + CSP hash の build failure を早期に検出できる
- `resources/list` / `resources/read` で UI Resource が見えるため、host compatibility の検証が先にできる
- README / Server Card が UI Resource を将来予定ではなく実体として示せる

### Negative

- npm tarball が約 85.9kB から増える可能性がある
- ext-apps と Vite の依存が増える
- UI はまだ tool metadata に接続していないため、v0.1.1 では host が自動表示しない場合がある

## References

- MCP Apps / ext-apps package: `@modelcontextprotocol/ext-apps`
- `src/resources/ui-resources.ts`
- `src/ui/corporate-card/`
- `src/ui/search-results/`
- `scripts/compute-csp-hashes.ts`
