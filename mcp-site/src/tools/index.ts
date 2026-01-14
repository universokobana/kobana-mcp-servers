import type { ToolDefinition } from './pages.js';
import { pagesTools } from './pages.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...pagesTools,
];
