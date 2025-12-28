#!/usr/bin/env node

import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getConfig, Config } from './config.js';
import { namespaces, getNamespaceByPath, NamespaceConfig } from './namespaces.js';

// Import tools from each MCP package
import { allTools as adminTools } from '../../mcp-admin/dist/tools/index.js';
import { allTools as chargeTools } from '../../mcp-charge/dist/tools/index.js';
import { allTools as dataTools } from '../../mcp-data/dist/tools/index.js';
import { allTools as ediTools } from '../../mcp-edi/dist/tools/index.js';
import { allTools as financialTools } from '../../mcp-financial/dist/tools/index.js';
import { allTools as paymentTools } from '../../mcp-payment/dist/tools/index.js';
import { allTools as transferTools } from '../../mcp-transfer/dist/tools/index.js';

// Import API clients from each MCP package
import { KobanaApiClient as AdminApiClient } from '../../mcp-admin/dist/api/client.js';
import { KobanaApiClient as ChargeApiClient } from '../../mcp-charge/dist/api/client.js';
import { KobanaApiClient as DataApiClient } from '../../mcp-data/dist/api/client.js';
import { KobanaApiClient as EdiApiClient } from '../../mcp-edi/dist/api/client.js';
import { KobanaApiClient as FinancialApiClient } from '../../mcp-financial/dist/api/client.js';
import { KobanaApiClient as PaymentApiClient } from '../../mcp-payment/dist/api/client.js';
import { KobanaApiClient as TransferApiClient } from '../../mcp-transfer/dist/api/client.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (client: unknown, args: unknown) => Promise<unknown>;
}

interface ActiveTransport {
  transport: SSEServerTransport;
  response: ServerResponse;
  namespace: string;
}

const activeTransports = new Map<string, ActiveTransport>();

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getToolsForNamespace(namespace: string): ToolDefinition[] {
  switch (namespace) {
    case 'admin': return adminTools as ToolDefinition[];
    case 'charge': return chargeTools as ToolDefinition[];
    case 'data': return dataTools as ToolDefinition[];
    case 'edi': return ediTools as ToolDefinition[];
    case 'financial': return financialTools as ToolDefinition[];
    case 'payment': return paymentTools as ToolDefinition[];
    case 'transfer': return transferTools as ToolDefinition[];
    default: return [];
  }
}

function getApiClientForNamespace(namespace: string, config: Config): unknown {
  switch (namespace) {
    case 'admin': return new AdminApiClient(config);
    case 'charge': return new ChargeApiClient(config);
    case 'data': return new DataApiClient(config);
    case 'edi': return new EdiApiClient(config);
    case 'financial': return new FinancialApiClient(config);
    case 'payment': return new PaymentApiClient(config);
    case 'transfer': return new TransferApiClient(config);
    default: return null;
  }
}

function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
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

function zodToJsonSchemaProperty(schema: z.ZodType): Record<string, unknown> {
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

  if (schema instanceof z.ZodUnion) {
    const options = schema.options as z.ZodType[];
    return {
      oneOf: options.map((opt) => zodToJsonSchemaProperty(opt)),
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

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
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

  return { type: 'string' };
}

function createMcpServer(namespace: string, config: Config): Server {
  const tools = getToolsForNamespace(namespace);
  const apiClient = getApiClientForNamespace(namespace, config);

  const server = new Server(
    {
      name: `kobana-mcp-${namespace}`,
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const toolsMap = new Map<string, ToolDefinition>();
  for (const tool of tools) {
    toolsMap.set(tool.name, tool);
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool) => ({
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
      const result = await tool.handler(apiClient, args || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
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

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kobana-Api-Url');
  res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
}

async function handleSSE(req: IncomingMessage, res: ServerResponse, ns: NamespaceConfig): Promise<void> {
  let config: Config;
  try {
    config = getConfig(
      req.headers.authorization || null,
      (req.headers['x-kobana-api-url'] as string) || null
    );
  } catch {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing or invalid authorization' }));
    return;
  }

  const sessionId = generateSessionId();
  res.setHeader('X-Session-Id', sessionId);

  const server = createMcpServer(ns.name, config);
  const transport = new SSEServerTransport(`${ns.path}/messages`, res);

  activeTransports.set(sessionId, { transport, response: res, namespace: ns.name });

  res.on('close', () => {
    activeTransports.delete(sessionId);
  });

  await server.connect(transport);
}

async function handleMessage(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing sessionId parameter' }));
    return;
  }

  const active = activeTransports.get(sessionId);
  if (!active) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Session not found' }));
    return;
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    await active.transport.handlePostMessage(req, res, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}

function handleHealth(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'healthy',
    server: 'kobana-mcp-unified',
    version: '1.0.0',
    activeSessions: activeTransports.size,
    namespaces: namespaces.map(ns => ns.name),
  }));
}

function handleInfo(_req: IncomingMessage, res: ServerResponse): void {
  const namespacesInfo = namespaces.map(ns => ({
    name: ns.name,
    path: ns.path,
    description: ns.description,
    endpoints: {
      sse: `${ns.path}/sse`,
      messages: `${ns.path}/messages`,
    },
    tools: getToolsForNamespace(ns.name).map(t => t.name),
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'kobana-mcp-unified',
    version: '1.0.0',
    description: 'Unified Kobana MCP Server for all namespaces',
    namespaces: namespacesInfo,
    totalTools: namespaces.reduce((sum, ns) => sum + getToolsForNamespace(ns.name).length, 0),
  }, null, 2));
}

function handleNamespaceInfo(ns: NamespaceConfig, _req: IncomingMessage, res: ServerResponse): void {
  const tools = getToolsForNamespace(ns.name);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: `kobana-mcp-${ns.name}`,
    version: '1.0.0',
    description: ns.description,
    endpoints: {
      sse: `${ns.path}/sse`,
      messages: `${ns.path}/messages`,
      health: '/health',
    },
    tools: tools.map(t => t.name),
  }, null, 2));
}

const httpServer = createHttpServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // Root endpoints
    if (pathname === '/health' && req.method === 'GET') {
      handleHealth(req, res);
      return;
    }

    if (pathname === '/' && req.method === 'GET') {
      handleInfo(req, res);
      return;
    }

    // Namespace endpoints
    const ns = getNamespaceByPath(pathname);
    if (ns) {
      const subpath = pathname.slice(ns.path.length);

      if (subpath === '' || subpath === '/') {
        handleNamespaceInfo(ns, req, res);
        return;
      }

      if (subpath === '/sse' && req.method === 'GET') {
        await handleSSE(req, res, ns);
        return;
      }

      if (subpath === '/messages' && req.method === 'POST') {
        await handleMessage(req, res);
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('Request error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Kobana Unified MCP Server running on http://${HOST}:${PORT}`);
  console.log('');
  console.log('Available namespaces:');
  for (const ns of namespaces) {
    console.log(`  ${ns.name.padEnd(12)} ${ns.path}/sse`);
  }
  console.log('');
  console.log('Global endpoints:');
  console.log(`  Health:    GET  http://${HOST}:${PORT}/health`);
  console.log(`  Info:      GET  http://${HOST}:${PORT}/`);
});

export { httpServer };
