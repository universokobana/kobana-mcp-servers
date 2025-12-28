import { batchesTools, ToolDefinition } from './batches.js';
import { pixTools } from './pix.js';
import { tedTools } from './ted.js';
import { internalTools } from './internal.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...batchesTools,
  ...pixTools,
  ...tedTools,
  ...internalTools,
];

export { batchesTools } from './batches.js';
export { pixTools } from './pix.js';
export { tedTools } from './ted.js';
export { internalTools } from './internal.js';
