# @sugukuru-labs/mcp-houjin-bangou

> **Model Context Protocol server for Japan's National Corporate Number (法人番号) Web-API by the National Tax Agency.**
> Full activation of all 7 MCP primitives + deterministic company-name normalization for real-world fuzzy data.

[![npm version](https://img.shields.io/npm/v/@sugukuru-labs/mcp-houjin-bangou.svg)](https://www.npmjs.com/package/@sugukuru-labs/mcp-houjin-bangou)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/sugukuru-labs/mcp-houjin-bangou/actions/workflows/ci.yml/badge.svg)](https://github.com/sugukuru-labs/mcp-houjin-bangou/actions/workflows/ci.yml)
[![MCP Spec 2025-11-25](https://img.shields.io/badge/MCP-2025--11--25-blue)](https://modelcontextprotocol.io/specification/2025-11-25)

🇯🇵 日本語版 README: [README.ja.md](README.ja.md)

## What this is

An MCP server that lets Claude Desktop, Cursor, VS Code Copilot, and any MCP-compatible client:

1. **Look up** a Japanese corporation by its 13-digit National Corporate Number (up to 10 at once)
2. **Search** by name with NTA's built-in fuzzy matching (hiragana↔katakana, case, dot deletion auto-handled)
3. **Normalize** fuzzy company names for the 7 patterns NTA's `target=1` fuzzy search *doesn't* cover
4. **Validate** check digits locally without consuming API quota
5. **Attribute** — returns the mandatory citation text per NTA ToS Article 6

All 5 tools come with **MCP Resources**, **Resource Templates** (`corp://{corporate_number}`), **Completion**, **Logging**, **Pagination**, and a **Server Card** at `/.well-known/mcp.json`. This is the only MCP server we know of that activates **all 7 official primitives** around the houjin-bangou API.

## Quick start

### Claude Desktop

1. Get a free NTA application ID from https://www.invoice-kohyo.nta.go.jp/web-api/pre-reg/ (same ID works for the 適格請求書発行事業者 API too).

2. Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "houjin-bangou": {
      "command": "npx",
      "args": ["-y", "@sugukuru-labs/mcp-houjin-bangou"],
      "env": {
        "NTA_APPLICATION_ID": "YOUR_ID_HERE"
      }
    }
  }
}
```

3. Restart Claude Desktop. Try:

> "株式会社スグクルの法人番号と本店所在地を教えて"

### Cursor / VS Code

See [`examples/`](examples/) for host-specific configs.

## Tools

| Tool | Purpose | API | Notes |
|---|---|---|---|
| `lookup_corporate_by_number` | Look up by 13-digit number | NTA `/4/num` | Up to 10 numbers at once (spec-enforced) |
| `search_corporate_by_name` | Search by company name | NTA `/4/name` | Pagination, prefecture/kind filters, fuzzy/exact/english modes |
| `validate_corporate_number` | Check digit validation | — | Local, no API call, no quota cost |
| `normalize_company_name` | Fuzzy name normalization | — | 7 patterns beyond NTA's `target=1` built-in fuzzy |
| `get_attribution` | Required citation text | — | Per NTA ToS Article 6 + 公共データ利用規約 v1.0 |

## Why this is a "role-model" MCP server

### 1. All 7 MCP primitives activated (not just Tools)

Most MCP servers ship with just Tools. This one activates:

- **Tools** × 5 (above)
- **Prompts** × 3 (`business-card-to-database`, `sales-list-enrichment`, `customer-master-dedup`) — pre-built workflow templates for real-world B2B use cases
- **Resources** (`attribution://houjin-bangou`)
- **Resource Templates** (`corp://{corporate_number}` — fetch a corporation as a resource)
- **Completion** — type `株式会社スグク…` and get suggestions from T7 normalizer in real-time; prompt argument enum completion also supported
- **Logging** — structured RFC 5424 severity logs via `notifications/message`
- **Pagination** — opaque cursors for the 2000+ result case (NTA spec mandates `divide`/`divideSize`)
- **Server Card** — `/.well-known/mcp.json` per SEP-2127 Draft + Transport WG (Dec 2025) direction

### 2. NTA fuzzy search awareness

Most "corporate number lookup" libraries reimplement normalization from scratch. We **read the NTA spec §4.6.2** and found that `target=1` already handles:

- hiragana ↔ katakana
- upper / lower case
- middle dot (·) / full-width space deletion

…so we skip these. Instead, `normalize_company_name` covers the 7 patterns NTA **doesn't**:

1. `(株)` / `㈱` / `株式会社` / `（株）` position swap (前株 ↔ 後株 ↔ 省略)
2. Corporate kind classification (株式 / 有限 / 合同 / 合名 / 合資 / 一般社団 / 特定非営利活動)
3. English → Japanese corp-name mapping (K.K. / Kabushiki Kaisha / Co.,Ltd. / Inc. / LLC)
4. NFKC normalization (half/full-width alphanumeric)
5. Old-character → new-character (髙→高, 齋→斎, 﨑→崎, …)
6. IVS (Ideographic Variation Selectors) removal
7. Whitespace canonicalization

### 3. Security by design

- **Read-only** — no write/delete/exec tools, `destructiveHint: false` everywhere
- **Application ID** from env only (never as a tool argument)
- **Log redaction** of `id=***`, bearer tokens, PII
- **Rate limit** 1 RPS + exponential backoff (avoids NTA 403 per ToS Article 9.1.3)
- **Prompt injection defense** layered across 6 levels — see [`docs/security/prompt-injection-defense.md`](docs/security/prompt-injection-defense.md)
- **Supply chain**: pnpm-lock committed, Dependabot weekly, CodeQL, `pnpm publish --provenance`

### 4. Spec-compliant at every level

- Every design decision cites NTA spec section (第一編・第二編・第六編)
- Every MCP feature cites its 2025-11-25 spec or SEP
- `docs/adr/0001-0010.md` records every major decision in Michael Nygard format

## Roadmap

| Version | ETA | Highlights |
|---|---|---|
| **v0.1.0** | 2026-05 | 5 tools + 7 primitives + Server Card |
| v0.2.0 | 2026-06 | MCP **Prompts** (business-card → DB / sales-list enrichment / customer-master dedup) + UI Resources |
| v0.3.0 | 2026-07 | Integration with **Qualified Invoice Issuer** (T番号) API — same application ID, doubles B2B KYC value |
| v0.5.0 | 2026-09 | Hosted edition + **Enterprise-Managed Authorization** (SEP-990) + **OAuth Client Credentials** + **Tasks** primitive (SEP-1699) for diff ingestion |
| v1.0.0 | 2026-10 | 6-host verification + Anthropic Directory submission + Skills (SEP-2076/2640) evaluation |

## Use case: business card OCR → CRM

Planned for v0.2.0 as the flagship MCP Prompt:

```
Step 1. User pastes business card OCR text into Claude
Step 2. Prompt `business-card-to-database` invokes:
   normalize_company_name(raw_text)
   → search_corporate_by_name(candidates[0])
   → Returns verified corporate number + address + kind
Step 3. LLM synthesizes a CRM record with attribution
Step 4. User reviews & inserts into their DB (HITL)
```

Enterprise integration (Document AI + secure DB write) is out of scope for the OSS and handled by Sugukuru's professional services — see [Sugukuru Inc.](https://sugukuru.co.jp).

## Documentation

- [Architecture Decision Records](docs/adr/)
- [Prompt Injection Defense](docs/security/prompt-injection-defense.md)
- [Privacy Policy](docs/policy/privacy-policy.md)
- [Terms of Service](docs/policy/terms-of-service.md)
- [SECURITY](SECURITY.md)
- [CONTRIBUTING](CONTRIBUTING.md)
- [CODE OF CONDUCT](CODE_OF_CONDUCT.md)

## Verification

This project treats tests and benchmarks as part of the public interface.

```bash
pnpm typecheck
pnpm test
pnpm bench
pnpm publish --dry-run --no-git-checks --access public
```

Current local verification snapshot:

| Check | Result |
|---|---:|
| Unit + integration tests | 151 passing |
| Property-based generated cases | 11,500+ |
| `computeCheckDigit` | ~18.8M ops/sec |
| `isValidCheckDigit` | ~10.1M ops/sec |
| `normalizeCompanyName` | ~344k ops/sec |
| `parseNtaCsv` | ~389k ops/sec |
| npm dry-run tarball | 85.9 kB / 145 files |

## Attribution

This project uses the **National Corporate Number System Web-API** provided by the National Tax Agency of Japan.

> **このサービスは、国税庁法人番号システム Web-API 機能を利用して取得した情報をもとに作成しているが、サービスの内容は国税庁によって保証されたものではない。**

Source: **国税庁法人番号公表サイト** (https://www.houjin-bangou.nta.go.jp/)
License: **公共データ利用規約 第1.0版** (Japanese Public Data License v1.0)
API Version: **Ver.4.0**

## License

MIT © 2026 Sugukuru K.K. (鹿児島 / Kagoshima, Japan)

## About Sugukuru

Sugukuru Inc. is an Indonesian-specialist human-resource dispatch company in Kagoshima, Japan, sending Specified Skilled Worker (特定技能) staff to farms nationwide. We build AI-enabled backoffice tools for immigration, agriculture, and small-business compliance. This is the first OSS in our **Sugukuru OSS Lab** series. Stay tuned for `mcp-jp-subsidy-hub`, `mcp-immigration-ja`, and more.
