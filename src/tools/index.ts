/**
 * Tool registration orchestrator
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { NtaClient } from '../api/nta-client.js';
import type { McpLogger } from '../lib/mcp-logger.js';
import { registerLookupByNumberTool } from './lookup-by-number.js';
import { registerSearchByNameTool } from './search-by-name.js';
import { registerValidateCheckDigitTool } from './validate-check-digit.js';
import { registerGetAttributionTool } from './get-attribution.js';
import { registerNormalizeCompanyNameTool } from './normalize-company-name.js';

export interface ToolDeps {
  ntaClient: NtaClient;
  logger: McpLogger;
}

export function registerAllTools(server: McpServer, deps: ToolDeps): void {
  registerLookupByNumberTool(server, deps);
  registerSearchByNameTool(server, deps);
  registerValidateCheckDigitTool(server);
  registerGetAttributionTool(server);
  registerNormalizeCompanyNameTool(server);
}
