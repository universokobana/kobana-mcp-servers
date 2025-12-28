import { usersTools, ToolDefinition } from './users.js';
import { subaccountsTools } from './subaccounts.js';
import { certificatesTools } from './certificates.js';
import { connectionsTools } from './connections.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...usersTools,
  ...subaccountsTools,
  ...certificatesTools,
  ...connectionsTools,
];

export { usersTools } from './users.js';
export { subaccountsTools } from './subaccounts.js';
export { certificatesTools } from './certificates.js';
export { connectionsTools } from './connections.js';
