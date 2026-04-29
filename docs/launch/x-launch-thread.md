# X (旧 Twitter) Launch Thread ドラフト

## タイミング設計

**2 投稿戦略** で 24 時間カバー:

- **9:00 JST**（日本読者の朝の通勤時間ゴールデンタイム）
- **22:00 JST = 6 AM PT**（US 西海岸の朝）

両方で同じスレッド（quote tweet で 2 回目を案内）。

## スレッド構成（13 投稿）

### Tweet 1（フック投稿、これだけで RT が回る）

```
国税庁の法人番号 Web-API を、Claude Desktop / Cursor / VS Code Copilot から
自然言語で使える MCP サーバーを公開しました。

MCP 公式 7 機能（Tools / Prompts / Resources / Templates / Completion / Logging / Pagination）
すべて活性化、世界初。

GitHub: https://github.com/sugukuru-labs/mcp-houjin-bangou

[demo.gif を添付]
```

文字数: 約 200 文字。GIF または image 必須（X algorithm が media-only post を高優先表示）。

### Tweet 2（差別化軸の核）

```
1/12

なぜ世界初？ほとんどの MCP サーバーは Tools だけ実装して停滞する。
MCP 公式仕様（2025-11-25）は 7 primitive 全部定義していて、
Anthropic 想定の client experience は全部使う前提。

このリポは「reference quality」MCP のお手本になる。
```

### Tweet 3（仕様書を読んだ証）

```
2/12

国税庁仕様書を 8 時間かけて読んだら、競合 OSS 15 本が誰も気づいていない事実を発見:

公式 API の `target=1` パラメータは **server 側で**
ひらがな ↔ カタカナ、英大小文字、中点削除を自動処理する（第二編 §4.6.2）

→ 多くの実装者がこれを重複実装している。
```

### Tweet 4（差別化のスコープ確定）

```
3/12

我々の T7 normalizer は、国税庁が拾えない 7 パターンに特化:

1. （株）/㈱/株式会社 の位置揺れ
2. 法人種別 16 種の正規化・分離
3. 英語法人名（K.K., Kabushiki Kaisha, Co.,Ltd., Inc., LLC）
4. NFKC（半角全角）
5. 旧字体 → 新字体（髙、齋、﨑 等 45 パターン）
6. IVS（異体字セレクタ）除去
7. 空白類の揃え
```

### Tweet 5（Completion の威力）

```
4/12

最強の差別化: Completion (`completion/complete`)

Resource Template `corp://{corporate_number}` の引数を typing 中に
T7 normalizer が裏で動いて候補を返す。

「株式会社スグク...」と打った瞬間に
['株式会社スグクル', 'スグクル', 'スグクル株式会社'] が候補に。

IDE autocomplete 級の UX、MCP server で実装してる人ほぼ皆無。
```

### Tweet 6（プロンプトインジェクション対策）

```
5/12

Simon Willison が 2025/4 に警告した MCP の Rug Pull / Tool Shadowing /
Tool Poisoning に対し、6 層防御を透明に公開した。

read-only な性質を最大の武器に:
全 tool description を静的定数化、CI で `<IMPORTANT>` 系の grep 検出。
docs/security/prompt-injection-defense.md
```

### Tweet 7（Attribution 必須化）

```
6/12

国税庁 Web-API 利用規約 別添1 第6条 の出典明記義務を、Zod schema で構造的に強制。

全 tool output に attribution が必須化される。
LLM が出典を user に伝える構造を強制 → 誤情報拡散の予防にも効く。

「Don't trust LLM, design for trust」を実装でやった例。
```

### Tweet 8（ADR 12 本）

```
7/12

設計判断は ADR 12 本で記録。Michael Nygard 形式。

License / Transport / 応答形式 / Zod / 認証 / Attribution /
target=1 補完 / SDK Tier 1 / Server Card path /
プロンプトインジェクション / Prompts 前倒し / インボイス API 統合計画

「判断を記録できる人」が「上級開発者」の定義。
```

### Tweet 9（Server Card / SEP-2127）

```
8/12

Server Card を `/.well-known/mcp.json` で先行公開。
Transport WG (2025-12) と SEP-2127 Draft の指定パスを採用。

registry / crawler が事前に capabilities を読める。
authentication / safety / specs_referenced を構造化メタデータで宣言。
```

### Tweet 10（v0.3.0 ロードマップ）

```
9/12

v0.3.0 (2026-07) で適格請求書発行事業者 Web-API（T 番号）を統合予定。
同じ application ID で動く（既に申請済み、Excel 提出 + 審査中）。

仕様差異マトリクスを ADR-0012 で先行整理。
v0.1.0 で T 番号 Branded type + コード辞書も準備層として実装済み。
```

### Tweet 11（craft signals 計画）

```
10/12

次の rc.4 で:
- fast-check property-based testing
- tinybench benchmark suite + README 表
- MCP Inspector programmatic contract test
- SLSA L3 provenance + OIDC trusted publishing
- CycloneDX SBOM 自動生成

「テストが実際にバグを検知できる」ことの客観的証明。
```

### Tweet 12（再現可能性）

```
11/12

この一連の手法を再利用可能な skill として抽出した。

`~/.cursor/skills/mcp-reference-build/SKILL.md`
docs/methodology/

仕様書読み → MCP 7 primitive 活性化 → craft signals → narrative → distribution
の全プロセス。次作 mcp-jp-subsidy-hub で完全再利用予定。
```

### Tweet 13（CTA）

```
12/12

GitHub: https://github.com/sugukuru-labs/mcp-houjin-bangou
Zenn 記事 (deep dive): https://zenn.dev/sugukuru/articles/mcp-houjin-bangou-v0.1.0
HN: https://news.ycombinator.com/item?id=...

Issue / PR / star / quote tweet 全部歓迎。
特に上級開発者からの craft 観点フィードバック求む。

#MCP #ModelContextProtocol #ClaudeDesktop #TypeScript #OSS
```

## ハッシュタグ戦略

- メイン: `#MCP` `#ModelContextProtocol` `#ClaudeDesktop`
- TypeScript 開発者向け: `#TypeScript` `#nodejs`
- 日本 OSS 向け: `#OSS` `#日本企業` `#インボイス`
- AI 開発者向け: `#Claude` `#Cursor` `#GitHubCopilot`

各 tweet で 1-3 個に絞る（hashtag spam は algorithm penalty）。

## 反応想定と対応

### Best case（500+ likes, 50+ RT）

- 引用 tweet で深掘り回答（thread を続ける）
- 質問が集中したテーマで Zenn / dev.to の続編記事
- Fukuoka MCP Community 登壇への布石

### Mid case（100-500 likes）

- フォロー外からのリプには丁寧に
- フォロワー外への露出を狙うために 22:00 JST 投稿で再 reach
- 24 時間で反応薄ければ HN 投稿で英語圏 reach

### Worst case（< 100 likes）

- 1 ヶ月後に v0.2.0 リリースで再投稿
- "Show HN" を主軸に切り替え（X は補助）
- HN で frontpage に乗ったら X で逆 reach

## 引用元アカウント候補（mention 検討）

- [@modelcontextprotocol](https://x.com/modelcontextprotocol) — 公式アカウント
- [@AnthropicAI](https://x.com/AnthropicAI) — Anthropic 本体
- [@cursor_ai](https://x.com/cursor_ai) — Cursor
- 日本 MCP コミュニティ関係者（個別調査要）

mention は乱発すると spam 判定されるため、**最大 1 アカウント**に絞る。
