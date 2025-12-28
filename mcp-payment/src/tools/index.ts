import { bankBilletsTools, ToolDefinition } from './bank-billets.js';
import { pixTools } from './pix.js';
import { darfsTools } from './darfs.js';
import { taxesTools } from './taxes.js';
import { utilitiesTools } from './utilities.js';
import { batchesTools } from './batches.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...bankBilletsTools,
  ...pixTools,
  ...darfsTools,
  ...taxesTools,
  ...utilitiesTools,
  ...batchesTools,
];

export { bankBilletsTools } from './bank-billets.js';
export { pixTools } from './pix.js';
export { darfsTools } from './darfs.js';
export { taxesTools } from './taxes.js';
export { utilitiesTools } from './utilities.js';
export { batchesTools } from './batches.js';
