import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerBusinessCardToDatabasePrompt } from './business-card-to-database.js';
import { registerSalesListEnrichmentPrompt } from './sales-list-enrichment.js';
import { registerCustomerMasterDedupPrompt } from './customer-master-dedup.js';

export function registerAllPrompts(server: McpServer): void {
  registerBusinessCardToDatabasePrompt(server);
  registerSalesListEnrichmentPrompt(server);
  registerCustomerMasterDedupPrompt(server);
}
