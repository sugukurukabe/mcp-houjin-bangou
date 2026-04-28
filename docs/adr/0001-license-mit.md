# ADR 0001: License = MIT

Date: 2026-04-29

## Status

Accepted

## Context

Sugukuru OSS Lab 創設リポジトリのライセンス選定。候補は MIT / Apache-2.0 / BSD-3-Clause。

## Decision

**MIT License を採用する。**

## Consequences

### Positive

- 既存の Japanese OSS エコシステム (SmartHR / yusukebe/Hono 等) と同じスタンスで、採用敷居が低い
- 個人開発者から企業ユーザーまで広く使える最シンプルライセンス
- scoped npm package `@sugukuru-labs/*` は `--access public` で問題なく公開可能
- downstream が Apache-2.0 に再ライセンスして使うことも可能

### Neutral

- MCP プロジェクト全体は Apache-2.0 (LF Projects) だが、SDK 利用側の我々は MIT でも互換性問題なし
- 特許条項 (Apache-2.0 の ALv2 Patent Grant) は本プロジェクトの性質 (API wrapper) では重要度が低い

### Negative

- 特許明示保護がないため、将来特許絡みの問題が生じた場合の防御が弱い → v1.0.0 で再評価

## Alternatives Considered

- **Apache-2.0**: MCP 本体と同じ、より protective。却下理由: MIT の方が OSS 採用障壁が低く、Sugukuru OSS Lab としての統一ブランドに適する
- **BSD-3-Clause**: ほぼ MIT と等価。却下理由: MIT の方が広く認知されている

## References

- MCP Governance: https://modelcontextprotocol.io/community/governance (Apache-2.0 default)
- SmartHR OSS: MIT License
