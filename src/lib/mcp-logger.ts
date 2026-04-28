/**
 * MCP Logging capability 用の emitter
 * MCP Logging notifications/message emitter per RFC 5424 severity
 * Emitor notifikasi log MCP
 *
 * 根拠 / Source:
 *   MCP 公式仕様 server/utilities/logging
 *   RFC 5424 - The Syslog Protocol
 *
 * セキュリティ要件 (公式):
 *   1. Log messages MUST NOT contain credentials, PII, internal system details
 *   2. Rate limit messages
 *   3. Validate all data fields
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

export type LogLevel =
  | 'debug'
  | 'info'
  | 'notice'
  | 'warning'
  | 'error'
  | 'critical'
  | 'alert'
  | 'emergency';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 7,
  info: 6,
  notice: 5,
  warning: 4,
  error: 3,
  critical: 2,
  alert: 1,
  emergency: 0,
};

export interface McpLogger {
  /** Set minimum log level threshold (called via logging/setLevel) */
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  /** Emit a structured log via notifications/message */
  log(level: LogLevel, logger: string, data: Record<string, unknown>): void;
  debug(logger: string, data: Record<string, unknown>): void;
  info(logger: string, data: Record<string, unknown>): void;
  warning(logger: string, data: Record<string, unknown>): void;
  error(logger: string, data: Record<string, unknown>): void;
}

/**
 * 機密情報を log から除去する (Application ID, email, bearer tokens)
 * Redact sensitive fields to prevent PII/credential leakage
 */
function redactSensitive(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('id') &&
      (lowerKey.includes('application') || lowerKey.includes('api_key'))
    ) {
      redacted[key] = '***REDACTED***';
    } else if (
      lowerKey.includes('token') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('password')
    ) {
      redacted[key] = '***REDACTED***';
    } else if (typeof value === 'string') {
      redacted[key] = value.replace(/id=[^&\s]+/g, 'id=***REDACTED***');
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function createMcpLogger(server: Server, initialLevel: LogLevel = 'info'): McpLogger {
  let currentLevel = initialLevel;

  function shouldEmit(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[currentLevel];
  }

  return {
    setLevel(level: LogLevel): void {
      currentLevel = level;
    },
    getLevel(): LogLevel {
      return currentLevel;
    },
    log(level: LogLevel, logger: string, data: Record<string, unknown>): void {
      if (!shouldEmit(level)) return;
      const redacted = redactSensitive(data);
      try {
        void server.notification({
          method: 'notifications/message',
          params: {
            level,
            logger,
            data: redacted,
          },
        });
      } catch {
        // Ignore when no client connected
      }
    },
    debug(logger, data): void {
      this.log('debug', logger, data);
    },
    info(logger, data): void {
      this.log('info', logger, data);
    },
    warning(logger, data): void {
      this.log('warning', logger, data);
    },
    error(logger, data): void {
      this.log('error', logger, data);
    },
  };
}
