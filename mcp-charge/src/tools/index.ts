import { pixAccountsTools, ToolDefinition } from './pix-accounts.js';
import { pixTools } from './pix.js';
import { pixCommandsTools } from './pix-commands.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...pixAccountsTools,
  ...pixTools,
  ...pixCommandsTools,
];

export { pixAccountsTools } from './pix-accounts.js';
export { pixTools } from './pix.js';
export { pixCommandsTools } from './pix-commands.js';
