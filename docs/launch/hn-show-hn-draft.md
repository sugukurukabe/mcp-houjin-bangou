# Hacker News "Show HN" 投稿ドラフト

## タイミング

- **公開 3-7 日後** の **火曜 or 水曜** の **US AM 6-8 (JST 22-24)** が peak
- 月曜は HN 全体の競争が激しい
- 木金は週末ロスが早い
- 土日は frontpage 維持時間が短い

## タイトル候補（76 文字以内推奨）

A. `Show HN: MCP server for Japan's National Corporate Number API (all 7 primitives)`
B. `Show HN: I built an MCP server activating all 7 official primitives, not just Tools`
C. `Show HN: Mcp-houjin-bangou – Japan corporate registry as MCP, with fuzzy matching`

→ **採用案: A** (最も具体的、Japan 文脈と craft 度の両方を一行で表現)

## 投稿本文（300 字以内推奨、改行控えめ）

```
Hi HN,

I built an MCP (Model Context Protocol) server that connects Claude Desktop, Cursor, and other MCP clients to Japan's National Tax Agency Web-API for corporate number lookup. Source: https://github.com/sugukuru-labs/mcp-houjin-bangou

Most MCP servers ship with just Tools, but I activated all 7 official primitives — Tools, Prompts, Resources, Resource Templates, Completion, Logging, Pagination — to demonstrate what a "reference quality" MCP server should look like. Particular highlights:

- Completion (`completion/complete`) wired to a deterministic name normalizer, so typing "株式会社スグク..." returns suggestions like an IDE autocomplete
- 7-pattern fuzzy matching that fills the gap NTA's built-in `target=1` doesn't cover (kanji variants, position of 株式会社, English suffixes like K.K. / Co.,Ltd., NFKC, IVS)
- 6-layer prompt injection defense documented openly
- 12 ADRs for every major design decision, citing both NTA spec and MCP 2025-11-25 spec sections

Roadmap: v0.2.0 ships UI Resources + named workflow Prompts. v0.3.0 integrates the Qualified Invoice Issuer Web-API (T-numbers).

Built solo while running Sugukuru Inc. (Indonesian SSW dispatch company in Kagoshima, Japan). Happy to answer technical questions about the spec-reading process or the MCP primitive activation philosophy.

GitHub: https://github.com/sugukuru-labs/mcp-houjin-bangou
Zenn (deep dive in JP): https://zenn.dev/sugukuru/articles/mcp-houjin-bangou-v0.1.0
```

文字数: 約 1500 文字（HN 推奨範囲、十分簡潔）

## 投稿前チェック

- [ ] GitHub repo が public、CI green、最新 commit に `feat: v0.1.0` 等の明確な tag
- [ ] Demo GIF が README 最上部に表示されている
- [ ] CDN / Cloudflare で `sugukuru-labs.dev` の前段キャッシュ設定（hug of death 対策）
- [ ] npm publish 完了（`npm info` で確認可能な状態）
- [ ] Zenn 記事は同時公開ではなく **2 日前** に公開済み（HN 投稿時に referencing できる）
- [ ] 自分のアカウントが HN で 30 日以上活動歴あり（new account ペナルティ回避）
- [ ] 投稿後の最初の 1 時間は能動的に Q&A 対応（reaction が rank に効く）

## コメントへの想定 Q&A

### Q: なぜ Tools だけじゃなく 7 primitive 全部活性化したのか？

A: 99% の MCP server は Tools だけで止まる。MCP 公式仕様 (https://modelcontextprotocol.io/specification/2025-11-25) は 7 primitive すべてを定義していて、Anthropic が望む client experience は全部使う前提。Completion を例にすると、Resource Template `corp://{corporate_number}` の引数を typing 中に IDE 補完候補が出る。これは Tools だけでは絶対に作れない UX で、reference quality を目指すなら必須。

### Q: なぜ `target=1` を再実装しなかった？

A: NTA's spec 第二編 §4.6.2 を読んで、API 自体が「ひらがな↔カタカナ」「英大小文字」「中点削除」を server-side で自動処理することを発見。これを再実装するのは waste of effort。代わりに NTA が拾えない 7 patterns（株式会社の position, 旧字体, NFKC, IVS, English corp suffixes 等）に専念。MCP 設計原則の "Composability over Specificity" の実践。

### Q: T-number (invoice issuer) はいつ統合？

A: v0.3.0 (2026-07 予定)。NTA は同じ application ID で 2 つの API（法人番号 + 適格請求書発行事業者）を提供している。Excel 申請書を提出済み、審査通過待ち。仕様差異マトリクスは ADR-0012 に記録済み。

### Q: Property-based testing or fuzz testing は？

A: 次の rc.4 で fast-check 統合予定。check-digit / normalizer / csv-parser に property-based test を追加する。現状は 137 unit + integration tests + 公式 MCP Inspector contract test。

### Q: Hosted version は？

A: v0.5.0 (2026-09 予定) に Cloud Run + Enterprise-Managed Authorization (SEP-990 ID-JAG) を実装予定。Sugukuru's enterprise tier として。

### Q: 日本以外でも使える？

A: 法人番号 / T-number は日本固有。ただし spec-reading discipline と 7-primitive activation pattern は対象 API 不問で完全に再利用可能。`~/.cursor/skills/mcp-reference-build/SKILL.md` で methodology を skill 化してある。

## 投稿後の運用

- 1 時間以内: 全コメント返信（reaction が rank algorithm に効く）
- 6 時間以内: 主要な technical question に深く答える
- 24 時間以内: traffic spike 中の issue / PR に丁寧に対応
- 1 週間後: 反応を分析した retrospective post を Zenn / dev.to に公開

## 保険: 反応が薄かった場合

- HN は 50% の確率で frontpage に行かない（運要素）
- 反応が薄い場合は 1 ヶ月待ってから別の角度で再投稿
- v0.2.0 のリリースで再度 Show HN 可能（"Show HN: I added 3 new MCP Prompts that..." 等）
