import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getConfig } from './config.js';
import { HelpCenterClient } from './api/client.js';
import { allTools } from './tools/index.js';
function zodToJsonSchema(schema) {
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            const zodValue = value;
            properties[key] = zodToJsonSchemaProperty(zodValue);
            if (!(zodValue instanceof z.ZodOptional)) {
                required.push(key);
            }
        }
        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
        };
    }
    return { type: 'object', properties: {} };
}
function zodToJsonSchemaProperty(schema) {
    if (schema instanceof z.ZodOptional) {
        return zodToJsonSchemaProperty(schema.unwrap());
    }
    if (schema instanceof z.ZodString) {
        return { type: 'string', description: schema.description };
    }
    if (schema instanceof z.ZodNumber) {
        return { type: 'number', description: schema.description };
    }
    if (schema instanceof z.ZodBoolean) {
        return { type: 'boolean', description: schema.description };
    }
    if (schema instanceof z.ZodEnum) {
        return { type: 'string', enum: schema.options, description: schema.description };
    }
    if (schema instanceof z.ZodArray) {
        return {
            type: 'array',
            items: zodToJsonSchemaProperty(schema.element),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            const zodValue = value;
            properties[key] = zodToJsonSchemaProperty(zodValue);
            if (!(zodValue instanceof z.ZodOptional)) {
                required.push(key);
            }
        }
        return {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodRecord) {
        return {
            type: 'object',
            additionalProperties: true,
            description: schema.description,
        };
    }
    return { type: 'string' };
}
export function createServer(config) {
    const server = new Server({
        name: 'kobana-mcp-help',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    let helpClient = null;
    function getClient() {
        if (!helpClient) {
            const cfg = config || getConfig();
            helpClient = new HelpCenterClient(cfg);
        }
        return helpClient;
    }
    const toolsMap = new Map();
    for (const tool of allTools) {
        toolsMap.set(tool.name, tool);
    }
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: allTools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: zodToJsonSchema(tool.inputSchema),
            })),
        };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const tool = toolsMap.get(name);
        if (!tool) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: `Unknown tool: ${name}` }),
                    },
                ],
                isError: true,
            };
        }
        try {
            const client = getClient();
            const result = await tool.handler(client, args || {});
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: errorMessage }),
                    },
                ],
                isError: true,
            };
        }
    });
    return server;
}
//# sourceMappingURL=server.js.map