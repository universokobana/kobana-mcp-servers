import { ediBoxesTools, ToolDefinition } from './edi-boxes.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...ediBoxesTools,
];

export { ediBoxesTools } from './edi-boxes.js';
