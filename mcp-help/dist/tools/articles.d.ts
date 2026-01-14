import { z } from 'zod';
import { HelpCenterClient } from '../api/client.js';
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: z.ZodType;
    handler: (client: HelpCenterClient, args: unknown) => Promise<unknown>;
}
export declare const searchArticlesTool: ToolDefinition;
export declare const getArticleTool: ToolDefinition;
export declare const articlesTools: ToolDefinition[];
//# sourceMappingURL=articles.d.ts.map