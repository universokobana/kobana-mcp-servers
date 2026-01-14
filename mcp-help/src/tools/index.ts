import { articlesTools, ToolDefinition } from './articles.js';

export type { ToolDefinition };

export const allTools: ToolDefinition[] = [
  ...articlesTools,
];

export { articlesTools } from './articles.js';
