import { z } from 'zod';
import { KobanaApiClient } from '../api/client.js';
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: z.ZodType;
    handler: (client: KobanaApiClient, args: unknown) => Promise<unknown>;
}
export declare const listMailboxEntriesTool: ToolDefinition;
export declare const getMailboxEntryTool: ToolDefinition;
export declare const createMailboxEntryTool: ToolDefinition;
export declare const updateMailboxEntryTool: ToolDefinition;
export declare const deleteMailboxEntryTool: ToolDefinition;
export declare const entriesTools: ToolDefinition[];
//# sourceMappingURL=entries.d.ts.map