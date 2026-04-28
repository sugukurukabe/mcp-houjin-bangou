# ADR 0003: 国税庁 API のレスポンス形式は CSV UTF-8 (type=02) を使用

Date: 2026-04-29

## Status

Accepted

## Context

国税庁 法人番号 Web-API Ver.4.0 は3種類のレスポンス形式を提供 (第二編 §2.1.3):

- `type=01`: CSV / Shift-JIS (JIS 第一・第二水準)
- `type=02`: CSV / UTF-8 (JIS 第一〜第四水準)
- `type=12`: XML / UTF-8 (JIS 第一〜第四水準)

## Decision

**`type=02` (CSV UTF-8) を固定採用する。**

## Consequences

### Positive

- UTF-8 で Node.js の fetch/Buffer と自然に相性が良い (Shift-JIS は iconv 依存が増える)
- JIS 第一〜第四水準まで受け取れる (商号に第三・第四水準漢字が含まれる法人も正常処理)
- CSV は XML より軽量・高速 (パース速度・メモリ効率)
- 36フィールドの順序固定なので positional パースで十分 (`src/api/csv-parser.ts`)
- 外字はイメージID として別途扱えば良い

### Negative

- ダブルクォーテーション・改行を含む値のエスケープ処理が必要 (RFC 4180 準拠)
  → 実装済: `parseCsvLine()` でクォート + `""` エスケープ対応
- XML の方がスキーマ明示的だが、本プロジェクトは Zod スキーマで代替

## Alternatives Considered

- **`type=12` (XML)**: スキーマ明示だが重い、パースライブラリ増える
- **`type=01` (CSV Shift-JIS)**: iconv 依存、第三・第四水準非対応
- **type 自動選択**: 複雑化、再現性低下

## References

- 国税庁仕様書 第二編 §2.1.3・§3.1.3・§4.1.3
- 国税庁仕様書 第二編 別紙1 リソース定義書 (36 項目)
