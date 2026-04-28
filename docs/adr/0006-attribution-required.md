# ADR 0006: Attribution field required on all tool outputs

Date: 2026-04-29

## Status

Accepted

## Context

国税庁 Web-API 機能利用規約 別添1 第6条 + 公共データ利用規約 第1.0版 別添3 は、本 API で取得した情報を利用するサービスに対し、指定文言と出典の明示を義務付けている。

## Decision

**すべての Tool output に `attribution` フィールドを必須化する (Zod required)。5 フィールド構成:**

- `data_source`: 国税庁法人番号公表サイトの URL
- `service_disclaimer`: 別添1 第6条の指定文言
- `license`: 公共データ利用規約 第1.0版
- `api_version`: Ver.4.0
- `accessed_at`: ISO 8601 タイムスタンプ

## Consequences

### Positive

- 法令遵守を構造的に強制 (LLM が出典を user に伝えられる)
- プロンプトインジェクション防御にも寄与 (出所の透明性)
- Anthropic Software Directory Policy の "no misleading information" 要件に整合
- 独立した `attribution://houjin-bangou` Resource と冗長だが、ツール出力で即時利用可

### Negative

- JSON 出力が若干冗長 (5 フィールド × 全 tool output)
- 人間可読性を重視する場合 `get_attribution` tool で短縮版を別途提供

## 指定文言 (別添1 第6条)

> このサービスは、国税庁法人番号システム Web-API 機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない。

## References

- 国税庁仕様書 第一編 別添1 第6条 (情報の取得元の明示)
- 国税庁仕様書 第一編 別添3 公共データ利用規約 第1.0版
