# 指名レビュー依頼テンプレート

上級開発者にレビューを依頼する際の文面集。
**DM ではなく open メンション or 公開 Discord** で送るのが鉄則
（DM は press 感が強く敬遠される。公開で「フィードバック歓迎」が低圧で効く）。

## 基本原則

1. 相手の時間を奪わない（30 秒で何を見て欲しいか分かる文）
2. 答えやすい質問を 1 つだけ（「全体どう？」は答えにくい）
3. 自分の craft への自信を控えめに表現（謙虚 80% / 自信 20%）
4. 相手にとってのメリットも示唆（「あなたの blog で言及されたあれを実装してみました」等）

## ターゲット候補（日本）

### @voluntas (Ryo Iwasawa)

- 詳細: 時雨堂代表、WebRTC SFU Sora 開発者、OSS 開発のロールモデル
- 関心領域: 高品質な技術文書、craft signals、零細企業 enterprise
- 接点: voluntas.tools の OSS 戦略 deep research を本プロジェクトの計画立案で参照済み

依頼文 (X):

```
@voluntas 国税庁 法人番号 Web-API を MCP 化する OSS を v0.1.0 で公開しました
https://github.com/sugukuru-labs/mcp-houjin-bangou

voluntas さんの「最適化と実用主義」「3 本目で抽象化」の哲学を意識して
ADR 12 本 + MCP 公式 7 機能フル活性化で組みました。
特に Tier-S craft signals (property-based test, SBOM, OIDC publish) の方針について
お時間あればフィードバック頂けると嬉しいです。

(無理ない範囲で OK です、見て頂けるだけで光栄です)
```

### @yusukebe (Yusuke Wada)

- 詳細: Hono 開発者、世界レベルの TypeScript / Edge 開発者
- 関心領域: TypeScript craft、Cloudflare Workers、軽量設計
- 接点: Hono の README 構造を README.md の参考にした

依頼文:

```
@yusukebe MCP server を v0.1.0 で公開しました
https://github.com/sugukuru-labs/mcp-houjin-bangou

Hono のシンプル + craft の両立を目指して、
Streamable HTTP stateless + Zod strict + Property-based testing 計画を組みました。

Cloudflare Workers にも乗せたい構成にしてます（v0.5.0 hosted）。
時間あれば README とか ADR とか craft signals 観点で見て頂けると嬉しいです。
```

### @mizchi (Koutaro Chikuba)

- 詳細: Next.js / TypeScript エコシステムの craft 開発者、Plaid 等で活躍
- 関心領域: TypeScript 高度な型、フロントエンド craft、AI Agent
- 接点: AI Agent 系の知見を多く発信

依頼文:

```
@mizchi MCP server を v0.1.0 で公開しました
https://github.com/sugukuru-labs/mcp-houjin-bangou

mizchi さんが言ってた「LLM の sidenote field を作るな」を意識して
Zod strict + Application ID env 限定で組んでます。
プロンプトインジェクション 6 層防御 (docs/security/prompt-injection-defense.md) も公開。

Agent 設計の観点でフィードバック頂けたら嬉しいです。
```

### @uhyo (Yuki Hirahara)

- 詳細: TypeScript 高度型 expert、書籍 "プロを目指す人のための TypeScript"
- 関心領域: TypeScript Branded Type、型安全性、教育的コード

依頼文:

```
@uhyo MCP server で TypeScript Branded Type を活用した OSS を v0.1.0 で公開しました
https://github.com/sugukuru-labs/mcp-houjin-bangou

法人番号 (13桁チェックデジット込) と T番号 (T+13桁) を Branded Type で区別、
checkDigit 計算は Property-based testing を計画中です。

src/domain/corporate-number.ts と invoice-number.ts の型設計について
お時間あれば見て頂けると勉強になります。
```

### @sosukesuzuki (Sosuke Suzuki)

- 詳細: Prettier core team、JavaScript / TypeScript ecosystem
- 関心領域: JavaScript tooling craft、open source maintenance

依頼文:

```
@sosukesuzuki Sugukuru OSS Lab の創設リポとして MCP server を公開しました
https://github.com/sugukuru-labs/mcp-houjin-bangou

CI/CD は SLSA L3 + OIDC trusted publishing を計画、
release.yml は将来の連作（mcp-jp-subsidy-hub 等）でテンプレ化予定です。

OSS 運営観点で気になる点があればフィードバック頂けたら嬉しいです。
```

## ターゲット候補（英語圏）

### @simonw (Simon Willison)

- 詳細: Datasette 開発者、LLM blog 著者、prompt injection 警告者
- 関心領域: LLM tools、security、SQL、craft
- 接点: 2025-04 の MCP prompt injection blog を本プロジェクトで参照

依頼文 (英語):

```
@simonw I built an MCP server for Japan's National Corporate Number API
https://github.com/sugukuru-labs/mcp-houjin-bangou

Inspired by your 2025-04 blog on MCP prompt injection, I documented
6-layer defense openly:
docs/security/prompt-injection-defense.md

Read-only by design, no sidenote-style fields, all tool descriptions
are static constants with CI grep guards.

Would love your feedback on the security model.
```

### @jxnl (Jason Liu)

- 詳細: Instructor (LLM structured output) 開発者、AI Agent expert
- 関心領域: LLM tool design、Pydantic / Zod patterns

依頼文 (英語):

```
@jxnl I built an MCP server activating all 7 official primitives
https://github.com/sugukuru-labs/mcp-houjin-bangou

Particularly proud of the Completion handler powered by deterministic
fuzzy matching - it gives an IDE-autocomplete UX inside Claude Desktop.

Curious for your take on the structured output strategy
(Zod strict + attribution required field).
```

## 投稿時の注意

- **同時に多人数に依頼しない**（spam 判定リスク）。1 日 1-2 人に絞る
- **失礼な圧をかけない**: 「(無理ない範囲で OK です)」を必ず入れる
- **相手のフォーマットに合わせる**: ja → 日本語、英 → 英語
- **公開 reply で接触**: open mention か、相手の Discord / Slack の質問チャンネル
- **依頼後の催促はしない**: 1 度声をかけたら return しない

## 反応がない場合

- 1 ヶ月後の v0.2.0 リリース時に新しい角度で再アプローチ
- 別の角度（実装 detail を blog に書いて mention）

## 反応があった場合

- 即座に返信（1 時間以内）
- 指摘事項は素直に受け入れて即実装
- 該当 issue の RT / star はもらった旨を別 tweet で公表（恩義を可視化）
