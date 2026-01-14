import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { allTools } from './tools/index.js';
function zodToJsonSchema(schema) {
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodToJsonSchema(value);
            // Check if the field is required (not optional)
            if (!(value instanceof z.ZodOptional)) {
                required.push(key);
            }
        }
        return {
            type: 'object',
            properties,
            ...(required.length > 0 ? { required } : {}),
        };
    }
    if (schema instanceof z.ZodString) {
        return { type: 'string', description: schema.description };
    }
    if (schema instanceof z.ZodNumber) {
        const result = { type: 'number', description: schema.description };
        // Check for min/max constraints
        const checks = schema._def.checks;
        for (const check of checks || []) {
            if (check.kind === 'min') {
                result.minimum = check.value;
            }
            if (check.kind === 'max') {
                result.maximum = check.value;
            }
        }
        return result;
    }
    if (schema instanceof z.ZodBoolean) {
        return { type: 'boolean', description: schema.description };
    }
    if (schema instanceof z.ZodEnum) {
        return {
            type: 'string',
            enum: schema.options,
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodArray) {
        return {
            type: 'array',
            items: zodToJsonSchema(schema.element),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodOptional) {
        return zodToJsonSchema(schema.unwrap());
    }
    if (schema instanceof z.ZodRecord) {
        return {
            type: 'object',
            additionalProperties: true,
            description: schema.description,
        };
    }
    // Default fallback
    return { type: 'object' };
}
export function createServer() {
    const server = new Server({
        name: 'kobana-mcp-site',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Register all tools
    const toolsMap = new Map();
    for (const tool of allTools) {
        toolsMap.set(tool.name, tool);
    }
    // Handle list tools request
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: allTools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: zodToJsonSchema(tool.inputSchema),
            })),
        };
    });
    // Handle call tool request
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const tool = toolsMap.get(name);
        if (!tool) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: false, error: `Unknown tool: ${name}` }),
                    },
                ],
                isError: true,
            };
        }
        try {
            const result = await tool.handler(args);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: false, error: errorMessage }),
                    },
                ],
                isError: true,
            };
        }
    });
    return server;
}
//# sourceMappingURL=server.js.map