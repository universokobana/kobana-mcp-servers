import { providersTools, ToolDefinition } from './providers.js';
import { accountsTools } from './accounts.js';
import { balancesTools } from './balances.js';
import { commandsTools } from './commands.js';
import { statementTransactionsTools } from './statement-transactions.js';
import { categoriesTools } from './categories.js';
import { importsTools } from './imports.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...providersTools,
  ...accountsTools,
  ...balancesTools,
  ...commandsTools,
  ...statementTransactionsTools,
  ...categoriesTools,
  ...importsTools,
];

export { providersTools } from './providers.js';
export { accountsTools } from './accounts.js';
export { balancesTools } from './balances.js';
export { commandsTools } from './commands.js';
export { statementTransactionsTools } from './statement-transactions.js';
export { categoriesTools } from './categories.js';
export { importsTools } from './imports.js';
