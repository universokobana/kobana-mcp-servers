import { z } from 'zod';
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: z.ZodType;
    handler: (args: unknown) => Promise<unknown>;
}
export declare const searchPagesTool: ToolDefinition;
export declare const getPageTool: ToolDefinition;
export declare const pagesTools: ToolDefinition[];
//# sourceMappingURL=pages.d.ts.map