# ADR 0007: T7 normalizer complements NTA `target=1` (non-overlapping)

Date: 2026-04-29

## Status

Accepted

## Context

国税庁 API の `target=1` (JIS 第一・第二水準あいまい検索) は既に以下を自動実施する (第二編 §4.6.2):

1. ひらがな → カタカナ置換
2. 英小文字 → 英大文字置換
3. 中点 (・)・全角スペース削除

T7 `normalize_company_name` のスコープをどう定義するか。

## Decision

**T7 は国税庁 `target=1` が吸収する揺れを実装しない。以下 7 パターンに特化する:**

1. `(株)`/`㈱`/`株式会社`/`（株）` の位置揺れ (前株・後株・省略 の3展開)
2. 法人種別 [株式/有限/合同/合名/合資/一般社団/特定非営利活動 等] の正規化 + 分離
3. 英語法人名 → 日本語候補 (K.K. / Kabushiki Kaisha / Co.,Ltd. / Inc. / LLC 検出)
4. 半角/全角英数字の正規化 (Unicode NFKC)
5. 旧字体 → 新字体 (髙→高・齋→斎・﨑→崎 等)
6. 異体字セレクタ (IVS / VS) の除去
7. 空白類の揃え (タブ・連続スペース・全角/半角)

## Consequences

### Positive

- 国税庁 API の正当な機能を尊重し重複実装しない (MCP 設計原則「特異性よりも構成可能性」)
- T7 の説明が明確 (「国税庁が拾えない 7 パターンだけをやる」)
- ドキュメント/README で差別化軸を端的に説明可能

### Negative

- ユーザーが target=1 の挙動を知らないと T7 のスコープを誤解する可能性 → tool description と README で明示

## References

- 国税庁仕様書 第二編 §4.6.2 (target 検索対象)
- MCP 設計原則 `community/design-principles` "Composability over Specificity"
