#!/usr/bin/env tsx
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const uiRoot = path.resolve(process.cwd(), 'dist/ui');

function sha256Base64(content: string): string {
  return createHash('sha256').update(content).digest('base64');
}

function injectCsp(filePath: string): void {
  const html = readFileSync(filePath, 'utf8');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1] ?? '');
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] ?? '');

  const scriptHashes = scripts.map((s) => `'sha256-${sha256Base64(s)}'`).join(' ');
  const styleHashes = styles.map((s) => `'sha256-${sha256Base64(s)}'`).join(' ');
  const csp = [
    "default-src 'none'",
    `script-src ${scriptHashes || "'none'"}`,
    `style-src ${styleHashes || "'none'"}`,
    "img-src data:",
    "font-src data:",
    "connect-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "require-trusted-types-for 'script'",
    'trusted-types houjin-mcp-ui',
  ].join('; ');

  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp.replace(/"/g, '&quot;')}">`;
  const withoutExisting = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/i, '');
  const updated = withoutExisting.replace(/<head>/i, `<head>\n    ${meta}`);
  writeFileSync(filePath, updated);
}

for (const dir of readdirSync(uiRoot, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const htmlPath = path.join(uiRoot, dir.name, 'mcp-app.html');
  injectCsp(htmlPath);
  process.stdout.write(`Injected CSP into ${htmlPath}\n`);
}
