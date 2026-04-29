# Non-Exposure Strategy — 露出よりも release を積む

このプロジェクトの基本姿勢は、登壇や SNS で人脈を作ることではない。霧島で原文を読み、コードを書き、仕様書に準拠した小さな release を積み続けること。

## 方針

1. **登壇しない**
   - 福岡 MCP Community 等の登壇は、原則参加しない。
   - 移動・準備・交流に使う時間は、property-based tests、benchmarks、v0.2.0 UI Resources、v0.3.0 インボイス API に使う。

2. **他の開発者と比較しない**
   - 「多くの開発者は」「他の OSS は」という framing を避ける。
   - 差別化は他者批評ではなく、仕様書・テスト・リリースで示す。

3. **露出を目的にしない**
   - X thread、HN Show HN、review request は default では実施しない。
   - どうしても必要な時は、artifact が十分重くなってから、短く、事実だけを置く。

4. **連続プロダクトで認知される**
   - `v0.1.0`: 法人番号 MCP
   - `v0.2.0`: UI Resources
   - `v0.3.0`: インボイス API
   - `v0.5.0`: Hosted + Enterprise Auth
   - `mcp-jp-subsidy-hub`: 次作
   - `mcp-immigration-ja`: 次々作

5. **昇段は外に出ることでなく、実装の密度で取る**
   - fast-check property-based tests
   - tinybench benchmarks
   - MCP Inspector contract tests
   - SLSA provenance
   - SBOM
   - mutation testing
   - 仕様書引用可能な ADR

## 書く時の基準

記事や SNS は「露出」ではなく、次の 3 つのどれかに該当する場合だけ書く。

| 書く理由 | 例 |
|---|---|
| 原文読解の成果を残す | 国税庁 `target=1` の仕様解説 |
| 次の実装者の時間を減らす | MCP 7 primitive activation playbook |
| プロダクトの信頼を増す | release gate / benchmark / security doc |

該当しないなら書かない。

## 非露出型 launch の実行順

```text
申請・ID取得
→ 本番 API smoke
→ v0.1.0 release
→ npm publish
→ README と Zenn 1 本だけ
→ すぐ v0.2.0 実装へ戻る
```

## X / HN / レビュー依頼の扱い

- `hn-show-hn-draft.md`: 保留。v1.0.0 まで使わない。
- `x-launch-thread.md`: 保留。必要なら release note 1 投稿のみ。
- `review-request-template.md`: 保留。こちらから名指しでレビュー依頼しない。

## 使ってよい短い公開文

```text
@sugukuru-labs/mcp-houjin-bangou v0.1.0 を公開しました。

国税庁 法人番号 Web-API Ver.4.0 を MCP から使うためのサーバです。
Tools / Prompts / Resources / Completion / Logging / Pagination / Server Card を実装しています。

仕様書と実装:
https://github.com/sugukuru-labs/mcp-houjin-bangou
```

これ以上は書かない。説明は README と ADR に任せる。

## 最後の原則

露出は目的ではない。積み上がった成果物が、こちらの不在を越えて届くときだけ意味がある。
