# ADR 0010: Prompt Injection Defense Layers

Date: 2026-04-29

## Status

Accepted

## Context

Simon Willison (2025-04) および Invariant Labs が示した MCP のプロンプトインジェクション攻撃 (Rug Pull / Tool Shadowing / Tool Poisoning) に対し、本プロジェクトは具体的な防御層を持たなければならない。

## Decision

**以下 6 層の防御を v0.1.0 から実装する:**

1. **静的 tool description** — `src/tools/*.ts` 内の定数で定義、ランタイム書換禁止
2. **CI で suspicious pattern 検知** — `.github/workflows/ci.yml` で `<IMPORTANT|<instruction|<system|ignore previous|disregard` を grep、検出時 fail
3. **`listChanged: false`** — tools capability で listChanged を無効化、運用中の tool リスト変更なし
4. **Zod strict 入力検証 (SEP-1303)** — sidenote 型フリースロット不可、不正は `isError: true` で返却
5. **Application ID は env のみ** — tool 引数経由で受け取らない、ログ出力時 redact
6. **`attribution` 必須化** — LLM が出典を user に伝えられる

## Consequences

### Positive

- 3 主要攻撃面 (Rug Pull / Tool Shadowing / Tool Poisoning) を構造的に阻止
- Read-only な性質が最大の防御に
- `docs/security/prompt-injection-defense.md` で攻撃面を透明化、コミュニティ貢献歓迎

### Negative

- 100% の防御は不可能 (LLM の誤動作は残存リスク)
- ホスト側 (Claude Desktop 等) の UI 改善にも依存

## References

- Simon Willison "Model Context Protocol has prompt injection security problems" (2025-04-09)
- Invariant Labs "Tool Poisoning Attacks"
- OWASP MCP Security Cheat Sheet 2026
- `docs/security/prompt-injection-defense.md`
