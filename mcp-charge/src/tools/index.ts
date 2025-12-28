import { pixAccountsTools, ToolDefinition } from './pix-accounts.js';
import { pixTools } from './pix.js';
import { pixCommandsTools } from './pix-commands.js';
import { automaticPixTools } from './automatic-pix.js';
import { paymentsTools } from './payments.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...pixAccountsTools,
  ...pixTools,
  ...pixCommandsTools,
  ...automaticPixTools,
  ...paymentsTools,
];

export { pixAccountsTools } from './pix-accounts.js';
export { pixTools } from './pix.js';
export { pixCommandsTools } from './pix-commands.js';
export { automaticPixTools } from './automatic-pix.js';
export { paymentsTools } from './payments.js';
