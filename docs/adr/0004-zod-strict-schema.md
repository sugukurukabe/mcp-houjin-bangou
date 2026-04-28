# ADR 0004: Zod strict schema for all tool I/O

Date: 2026-04-29

## Status

Accepted

## Context

MCP Tool の input/output schema バリデーション戦略。プロンプトインジェクション防御の観点でも重要。

## Decision

**すべての Tool input/output schema は Zod `.strict()` = `additionalProperties: false` を適用する。**
**バリデーション失敗は JSON-RPC エラーではなく、`result.isError: true` + structured output でツール実行エラーとして返す (SEP-1303 準拠)。**

## Consequences

### Positive

- Tool Poisoning 攻撃の防御層になる (sidenote 型フリースロット不可)
- LLM が自己修復可能な構造化エラーを返せる
- 型レベルで input の不正検出が可能
- output に `attribution` 必須を強制できる
- Zod v3 の豊富な validators (enum, regex, min/max) でドメイン制約を明示

### Negative

- 初期実装コストが schema less より少し高い → `src/domain` の zod schema で一元管理
- 将来の拡張で optional フィールド追加時に厳密な互換性管理が必要

## Alternatives Considered

- **JSON Schema 直書き**: タイプセーフティなし
- **TypeBox / Valibot**: MCP SDK が Standard Schema 対応、Zod が一次採用

## References

- SEP-1303: Input Validation Errors as Tool Execution Errors (Final)
- MCP TypeScript SDK v1.x: `registerTool` uses Zod shape
