# Architecture / アーキテクチャ

## 全体図 / Overview

```mermaid
flowchart LR
  subgraph Host["MCP Host (Client)"]
    Claude["Claude Desktop"]
    Cursor["Cursor"]
    VSCode["VS Code Copilot"]
  end

  subgraph Server["@sugukuru/mcp-houjin-bangou (Node.js)"]
    direction TB
    Express["Express 4"]
    Transport["StreamableHTTPServerTransport<br/>stateless"]
    McpLayer["McpServer (SDK v1)"]
    Logger["McpLogger<br/>notifications/message<br/>RFC 5424"]
    subgraph Primitives["7 MCP Primitives"]
      Tools["5 Tools"]
      Resources["Resources + Templates"]
      Completion["Completion handler"]
      Logging["Logging capability"]
      Pagination["Pagination (cursor)"]
      ServerCard["Server Card<br/>/.well-known/mcp.json"]
    end
    subgraph Domain["Domain Layer (pure)"]
      CheckDigit["check-digit.ts"]
      Normalizer["normalizer.ts (T7, 7 patterns)"]
      Codes["kind / process / close-cause / prefecture codes"]
    end
    subgraph Api["API Client"]
      NtaClient["NtaClient (DI seam)"]
      CsvParser["csv-parser"]
      RateLimiter["TokenBucket<br/>1 RPS + backoff"]
    end
  end

  subgraph External["External"]
    NTA["国税庁 Web-API Ver.4.0<br/>api.houjin-bangou.nta.go.jp/4"]
  end

  Host -->|POST /mcp<br/>JSON-RPC 2.0| Express
  Express --> Transport
  Transport --> McpLayer
  McpLayer --> Primitives
  Tools --> Domain
  Tools --> Api
  Resources --> Api
  Completion --> Normalizer
  McpLayer -. notifications .-> Logger
  NtaClient --> RateLimiter
  NtaClient --> CsvParser
  NtaClient -->|"GET /num /name /diff<br/>type=02 CSV UTF-8"| NTA
```

## レイヤー構造 / Layered Structure

| Layer | Path | Responsibility |
|---|---|---|
| **Transport** | `src/server.ts` | Express + Streamable HTTP boot + stateless transport |
| **MCP Protocol** | `src/mcp.ts` | McpServer factory + capability negotiation |
| **Primitives** | `src/tools/` `src/resources/` `src/completion/` | Tool / Resource / Completion handlers |
| **Domain** | `src/domain/` | 純粋ロジック (check-digit, normalizer, codes) |
| **External IO** | `src/api/` | NTA API client + CSV parser + rate limiter |
| **Cross-cutting** | `src/lib/` | env / errors / result / logger / pagination |

## データフロー: 法人名検索 + ページング

```mermaid
sequenceDiagram
  participant C as MCP Host
  participant S as MCP Server
  participant R as RateLimiter
  participant N as 国税庁 API

  C->>S: tools/call search_corporate_by_name<br/>{name, cursor?}
  S->>S: decodeCursor(cursor) → divide=N
  S->>R: acquire()
  R-->>S: token granted
  S->>N: GET /4/name?name=...&divide=N&type=02
  N-->>S: CSV (header + corporations[])
  S->>S: parseNtaCsv(csv)
  S->>S: computeNextCursor(divideNumber, divideSize)
  S-->>C: {corporations, next_cursor, attribution}
  Note right of C: 次ページが必要なら<br/>next_cursor を cursor に指定して再呼出
```

## データフロー: 名刺OCR ワークフロー (v0.2.0 予定)

```mermaid
sequenceDiagram
  participant U as User
  participant LLM as Claude
  participant P as Prompt<br/>"business-card-to-database"
  participant T7 as normalize_company_name
  participant T2 as search_corporate_by_name
  participant CRM as Customer DB

  U->>LLM: 名刺OCR結果を貼り付け<br/>"（株）高橋商事..."
  LLM->>P: prompts/get business-card-to-database
  P-->>LLM: 構造化指示 (normalize → search → insert)
  LLM->>T7: tools/call normalize_company_name
  T7-->>LLM: candidates[]: 前株/後株/旧字体
  loop confidence 降順
    LLM->>T2: tools/call search_corporate_by_name<br/>with candidate
    T2-->>LLM: 法人番号 + 本店住所 + attribution
    alt Found
      LLM->>U: 確認プロンプト (HITL)
      U->>CRM: 確認済みレコード投入
    end
  end
```

## プロンプトインジェクション防御層

```mermaid
flowchart TB
  Input["Untrusted LLM Input"]
  L1["L1: Zod strict input validation<br/>additionalProperties: false"]
  L2["L2: Static tool description<br/>CI grep guard"]
  L3["L3: Env-only Application ID<br/>never via tool args"]
  L4["L4: Rate limit + backoff<br/>1 RPS token bucket"]
  L5["L5: Log redaction<br/>***REDACTED***"]
  L6["L6: Attribution required<br/>on every output"]
  Api["NTA Web-API"]
  Output["Safe Output"]

  Input --> L1
  L1 --> L2
  L2 --> L3
  L3 --> L4
  L4 --> Api
  Api --> L5
  L5 --> L6
  L6 --> Output
```

## 参考 / References

- 国税庁 Web-API 仕様書 第一編 (4.9版) / 第二編 (1.2版) / 第六編 (1.2版)
- MCP 公式仕様 (2025-11-25)
- 2026 MCP Roadmap (2026-03-09)
- Transport WG "Exploring the Future of MCP Transports" (2025-12-19)
- SEP-2127 Server Card (Draft) / SEP-1303 Input Validation (Final) / SEP-986 Tool Names (Final)
- Simon Willison "MCP has prompt injection security problems" (2025-04-09)
