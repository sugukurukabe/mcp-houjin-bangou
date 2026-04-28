# API Reference

本 MCP サーバが提供する全 5 Tool + 2 Resources + Resource Template + Completion の完全リファレンス。

## Tools

### 1. `lookup_corporate_by_number`

**目的**: 13桁の法人番号で法人情報を検索 (最大10件)。

**呼出 API**: NTA `GET /4/num?id=...&number=...&type=02&history=0|1`

**annotations**: `readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true`

**Input**:

```typescript
{
  corporate_numbers: string[];   // 1-10 items, 13-digit each
  include_history?: boolean;      // default false
  language?: 'ja' | 'en';         // default 'ja'
}
```

**Output**:

```typescript
{
  corporations: Corporation[];
  not_found: string[];
  invalid_inputs: Array<{ input: string; reason: string }>;
  attribution: Attribution;
}
```

**エラー**:

- 入力が 0 件または 11 件以上 → `isError: true`, `invalid_inputs`
- チェックデジット不一致 → `invalid_inputs` に追加 (API は叩かない)
- 国税庁 API 404 → `NtaApiError.http_404`

**仕様根拠**: 第六編 §2.1, 第二編 §2.1.3

---

### 2. `search_corporate_by_name`

**目的**: 法人名で法人情報を検索 (ページング対応)。

**呼出 API**: NTA `GET /4/name?id=...&name=...&type=02&mode=...&target=...`

**annotations**: `readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true`

**Input**:

```typescript
{
  name: string;                                // required, max 150 chars ja / 300 chars en
  match_mode?: 'prefix' | 'partial';           // default 'prefix' (= mode=1)
  search_target?: 'fuzzy' | 'exact' | 'english'; // default 'fuzzy' (= target=1)
  prefecture?: string;                         // 2-digit or 5-digit JIS code
  kind?: Array<'01' | '02' | '03' | '04'>;     // max 4
  include_history?: boolean;                   // default false (= change=0)
  include_closed?: boolean;                    // default true (= close=1)
  cursor?: string;                             // opaque, from previous next_cursor
}
```

**Output**:

```typescript
{
  total: number;
  page_number: number;
  page_size: number;
  corporations: Corporation[];
  next_cursor: string | null;
  last_update_date: string;
  attribution: Attribution;
}
```

**検索対象 (`search_target`) の挙動**:

- `fuzzy` (target=1, デフォルト) → 国税庁側で ひらがな↔カタカナ, 英大小文字, 中点・全角スペース削除を自動処理
- `exact` (target=2) → JIS 第一〜第四水準で完全一致
- `english` (target=3) → 英語表記フィールドを検索

**ページング**:

- NTA 側 2000 件超過時に `divideSize > 1` になる
- クライアントは `next_cursor` を次の `cursor` として渡せば次ページ取得
- 最終ページは `next_cursor: null`

**仕様根拠**: 第六編 §4.1, 第二編 §4.1.3, §4.6.1, §4.6.2, §4.5

---

### 3. `validate_corporate_number`

**目的**: チェックデジット検証 (ローカル計算、API 呼出なし)。

**annotations**: `readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false`

**Input**:

```typescript
{
  corporate_number: string;  // ハイフン・全角数字・空白許容
}
```

**Output**:

```typescript
{
  is_valid: boolean;
  normalized: string | null;  // 半角13桁に正規化
  reason: 'ok' | 'not_13_digits' | 'check_digit_mismatch' | 'invalid_characters' | 'first_digit_zero';
  guidance: string;
  attribution: Attribution;
}
```

**チェックデジット計算式** (第二編 §2.1.3):

```
c = 9 - ( Σ_{n=1}^{12} (P_n × Q_n) mod 9 )
  ただし c が 0 のとき c = 9
P_n: 12桁基礎番号の左から n 桁目 (1-indexed)
Q_n: n 奇数 → 2, n 偶数 → 1
```

---

### 4. `get_attribution`

**目的**: NTA Web-API 機能利用規約 + 公共データ利用規約 第1.0版 の指定出典文を返却。

**annotations**: `readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false`

**Input**:

```typescript
{
  format?: 'full' | 'short' | 'citation';  // default 'full'
  language?: 'ja' | 'en';                   // default 'ja'
}
```

**Output**:

```typescript
{
  attribution: Attribution;
  formatted_text: string;   // format に応じた整形済み文字列
  usage_guidance: string;   // 下流サービスでの使用ガイダンス
}
```

**仕様根拠**: 第一編 別添1 第6条, 別添3 公共データ利用規約 第1.0版

---

### 5. `normalize_company_name`

**目的**: 国税庁 `target=1` が吸収しない 7 パターンの表記揺れを補完、検索候補を生成。

**annotations**: `readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false`

**Input**:

```typescript
{
  raw_input: string;  // 1-500 chars
}
```

**Output**:

```typescript
{
  original: string;
  extracted_core_name: string;
  normalized_candidates: Array<{
    name: string;
    kind_hint: KindHint;          // 16 kind types
    prefix_or_suffix: 'mae_kabu' | 'ato_kabu' | 'none';
    suggested_target: '1' | '2' | '3';
    confidence: number;           // 0-1
    applied_rules: string[];
  }>;
  fallback_note?: string;
  recommendation: string;
  attribution: Attribution;
}
```

**補完パターン** (ADR-0007):

1. `(株)/㈱/株式会社/（株）` 位置揺れ (前株/後株/省略)
2. 法人種別の正規化・分離
3. 英語法人名 → 日本語候補 (K.K./Kabushiki Kaisha/Co.,Ltd./Inc./LLC)
4. NFKC 正規化
5. 旧字体 → 新字体 (髙/齋/﨑 等)
6. IVS 除去
7. 空白類の揃え

---

## Resources

### `attribution://houjin-bangou`

**mimeType**: `application/json`

**Content**: 出典情報の JSON オブジェクト (`Attribution` schema と同じ)

---

## Resource Templates

### `corp://{corporate_number}`

**Variable**: `{corporate_number}` は 13桁の法人番号

**mimeType**: `application/json`

**Content**:

```typescript
{
  corporation: Corporation | null;
  last_update_date: string;
  attribution: Attribution;
}
```

**エラーケース**:

- チェックデジット不一致 → `{ error: { reason, message }, attribution }`
- 国税庁 API エラー → `{ error: { code, message, httpStatus }, attribution }`

---

## Completion

### `completion/complete`

**対応する参照タイプ**:

| `ref.type` | 条件 | 動作 |
|---|---|---|
| `ref/resource` | `uri` が `corp://` で始まる | 入力が数字でないとき T7 normalizer で候補生成 |
| `ref/prompt` | `argument.name` が `company_name` or `name` | T7 normalizer で候補生成 (v0.2.0+ の Prompts 想定) |
| その他 | - | 空配列 |

**最大 20 候補** (MCP 仕様は 100 だが、T7 の候補上限 10 を反映)

---

## Logging

### `notifications/message`

RFC 5424 severity に従い、以下のイベントを emit:

| Level | Logger | 発生条件 |
|---|---|---|
| `info` | `tool.lookup_corporate_by_number` | T1 呼出時 |
| `info` | `tool.search_corporate_by_name` | T2 呼出時 |
| `error` | `tool.*.api_error` | NTA API エラー (code/httpStatus/ntaErrorCode 付き) |
| `warning` | `nta-client` | 403 受信時のバックオフ発動 (server.ts の pino log に加え) |
| `debug` | `completion.request` | Completion 要求 |
| `info` | `resource.corporate.read` | corp:// Resource 読込み時 |

**Redaction**: Application ID / bearer token / password を自動マスク。

---

## Shared Types

### `Attribution`

```typescript
{
  data_source: string;          // 出典 URL
  service_disclaimer: string;    // 別添1 第6条 の指定文言
  license: '公共データ利用規約 第1.0版';
  api_version: 'Ver.4.0';
  accessed_at: string;           // ISO 8601
}
```

### `Corporation`

国税庁仕様書 第二編 別紙1 の 36 フィールドに準拠。主要フィールド:

```typescript
{
  corporate_number: string;         // 13桁
  sequence_number: number;          // 一連番号
  process: string;                  // 処理区分 (01/11/12/13/21/22/71/72/81/99)
  correct: '0' | '1';               // 訂正区分
  update_date: string;              // YYYY-MM-DD
  change_date: string;              // YYYY-MM-DD
  name: string;                     // 商号又は名称
  kind: string;                     // 法人種別 (101/201/301-305/399/401/499)
  prefecture_name: string;
  city_name: string;
  street_number: string;
  prefecture_code: string;          // JIS X 0401
  city_code: string;                // JIS X 0402
  post_code: string;
  close_date: string;
  close_cause: string;              // 01/11/21/31
  successor_corporate_number: string;
  assignment_date: string;          // 法人番号指定年月日
  latest: '0' | '1';                // 最新情報フラグ
  en_name: string;
  furigana: string;                 // 全角カタカナ・長音のみ
  hihyoji: '0' | '1';               // 検索対象除外 (Ver.4.0 追加)
  // ... 他 13 フィールド
}
```

---

## エラーコード

### 本 MCP の tool 実行エラー (SEP-1303 準拠)

`result.isError: true` + `structuredContent` に詳細:

```typescript
{
  error: {
    code: NtaErrorCode;        // http_400 / http_403 / http_404 / http_500 / timeout / parse_error / network_error
    message: string;
    httpStatus?: number;
    guidance?: string;          // ユーザー向け修正ガイダンス
  };
  attribution: Attribution;
}
```

### 国税庁 API エラーコード (第二編 別紙2)

| HTTP | NTA コード | 発生条件 | 本 MCP 対応 |
|---|---|---|---|
| 400 | 040-043 | 法人番号指定エラー | Zod で事前検証 |
| 400 | 070-073 | 応答形式エラー | `type=02` 固定で回避 |
| 400 | 100-112 | 商号/検索方式エラー | Zod で事前検証 |
| 400 | 180 | 結果件数過多 | ページング誘導 + guidance |
| 403 | - | レート制限 | 30s→1m→5m→30m 指数バックオフ |
| 404 | - | ID 無効/失効 | エラー返却 (3年無利用停止の可能性) |
| 500 | - | NTA システム障害 | リトライ不可、Logging error |

---

## 参考

- [国税庁 法人番号 Web-API 機能 仕様書](https://www.houjin-bangou.nta.go.jp/webapi/)
- [MCP 公式仕様 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [ADR 0001-0010](adr/)
