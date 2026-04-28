import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { NtaClient } from '../api/nta-client.js';
import type { McpLogger } from '../lib/mcp-logger.js';
import { registerAttributionResource } from './attribution.js';
import { registerCorporateResourceTemplate } from './corporate-template.js';

export function registerAllResources(
  server: McpServer,
  deps: { ntaClient: NtaClient; logger: McpLogger },
): void {
  registerAttributionResource(server);
  registerCorporateResourceTemplate(server, deps);
}
