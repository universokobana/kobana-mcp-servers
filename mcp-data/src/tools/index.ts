import { bankBilletQueriesTools, ToolDefinition } from './bank-billet-queries.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...bankBilletQueriesTools,
];

export { bankBilletQueriesTools } from './bank-billet-queries.js';
