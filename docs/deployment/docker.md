# Docker 配布 (v0.3.0 予定)

> **v0.1.0 では npx 配布のみです。Docker イメージは v0.3.0 でリリース予定。**

本ドキュメントは v0.3.0 に向けた設計メモを兼ねます。

## 予定しているイメージ

`ghcr.io/sugukurukabe/mcp-houjin-bangou:v0.3.0` (GitHub Container Registry)

## Dockerfile 設計方針

- **Distroless multi-stage build** (`gcr.io/distroless/nodejs20-debian12:nonroot`)
- 非 root ユーザで実行
- 最終イメージサイズ < 150MB 目標
- `pnpm deploy` で本番依存のみを bundle

## Dockerfile (v0.3.0 予定)

```dockerfile
# Stage 1: build
FROM node:20.19.0-slim AS build
WORKDIR /build
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm deploy --prod /app

# Stage 2: runtime (distroless)
FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app
COPY --from=build --chown=nonroot:nonroot /app /app
USER nonroot
EXPOSE 3001
ENV NODE_ENV=production
CMD ["dist/server.js"]
```

## 実行

```bash
docker run --rm -p 3001:3001 \
  -e NTA_APPLICATION_ID=your-id \
  ghcr.io/sugukurukabe/mcp-houjin-bangou:v0.3.0
```

## Health check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -q -O- http://localhost:3001/health || exit 1
```

## Kubernetes/Cloud Run への展開

v0.5.0 で Cloud Run Hosted 版をリリース予定です。詳細は [cloud-run.md](cloud-run.md) 参照。
