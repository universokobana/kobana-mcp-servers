import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import tools from each MCP package
import { allTools as adminTools } from '../mcp-admin/dist/tools/index.js';
import { allTools as chargeTools } from '../mcp-charge/dist/tools/index.js';
import { allTools as dataTools } from '../mcp-data/dist/tools/index.js';
import { allTools as ediTools } from '../mcp-edi/dist/tools/index.js';
import { allTools as financialTools } from '../mcp-financial/dist/tools/index.js';
import { allTools as paymentTools } from '../mcp-payment/dist/tools/index.js';
import { allTools as transferTools } from '../mcp-transfer/dist/tools/index.js';

// Import API clients from each MCP package
import { KobanaApiClient as AdminApiClient } from '../mcp-admin/dist/api/client.js';
import { KobanaApiClient as ChargeApiClient } from '../mcp-charge/dist/api/client.js';
import { KobanaApiClient as DataApiClient } from '../mcp-data/dist/api/client.js';
import { KobanaApiClient as EdiApiClient } from '../mcp-edi/dist/api/client.js';
import { KobanaApiClient as FinancialApiClient } from '../mcp-financial/dist/api/client.js';
import { KobanaApiClient as PaymentApiClient } from '../mcp-payment/dist/api/client.js';
import { KobanaApiClient as TransferApiClient } from '../mcp-transfer/dist/api/client.js';

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (client: unknown, args: unknown) => Promise<unknown>;
}

interface Config {
  accessToken: string;
  apiUrl: string;
}

interface NamespaceConfig {
  name: string;
  path: string;
  description: string;
}

const namespaces: NamespaceConfig[] = [
  { name: 'admin', path: '/admin', description: 'Certificates, connections, subaccounts, users' },
  { name: 'charge', path: '/charge', description: 'Pix charges, accounts, automatic pix, payments' },
  { name: 'data', path: '/data', description: 'Bank accounts validation' },
  { name: 'edi', path: '/edi', description: 'EDI file processing' },
  { name: 'financial', path: '/financial', description: 'Transactions, balances, statements' },
  { name: 'payment', path: '/payment', description: 'Payments, batches, payees' },
  { name: 'transfer', path: '/transfer', description: 'Wire transfers and Pix transfers' },
];

function getNamespaceByPath(pathname: string): NamespaceConfig | undefined {
  return namespaces.find(ns => pathname === ns.path || pathname.startsWith(ns.path + '/'));
}

function getConfig(authHeader: string | null, apiUrlHeader: string | null): Config {
  let accessToken = process.env.KOBANA_ACCESS_TOKEN || '';

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      accessToken = parts[1];
    }
  }

  if (!accessToken) {
    throw new Error('Missing access token');
  }

  return {
    accessToken,
    apiUrl: apiUrlHeader || process.env.KOBANA_API_URL || 'https://api.kobana.com.br',
  };
}

interface ActiveTransport {
  transport: SSEServerTransport;
  server: Server;
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
    { name: `kobana-mcp-${namespace}`, version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  const toolsMap = new Map<string, ToolDefinition>();
  for (const tool of tools) {
    toolsMap.set(tool.name, tool);
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.inputSchema),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolsMap.get(name);

    if (!tool) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
    }

    try {
      const result = await tool.handler(apiClient, args || {});
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: errorMessage }) }],
        isError: true,
      };
    }
  });

  return server;
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kobana-Api-Url');
  res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
}

async function handleSSE(req: VercelRequest, res: VercelResponse, ns: NamespaceConfig): Promise<void> {
  let config: Config;
  try {
    config = getConfig(
      req.headers.authorization || null,
      (req.headers['x-kobana-api-url'] as string) || null
    );
  } catch {
    res.status(401).json({ error: 'Missing or invalid authorization' });
    return;
  }

  const sessionId = generateSessionId();
  res.setHeader('X-Session-Id', sessionId);

  const server = createMcpServer(ns.name, config);
  const transport = new SSEServerTransport(`${ns.path}/messages`, res as unknown as import('http').ServerResponse);

  activeTransports.set(sessionId, { transport, server, namespace: ns.name });

  res.on('close', () => {
    activeTransports.delete(sessionId);
  });

  await server.connect(transport);
}

async function handleMessage(req: VercelRequest, res: VercelResponse): Promise<void> {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).json({ error: 'Missing sessionId parameter' });
    return;
  }

  const active = activeTransports.get(sessionId);
  if (!active) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    await active.transport.handlePostMessage(
      req as unknown as import('http').IncomingMessage,
      res as unknown as import('http').ServerResponse,
      body
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}

function handleHealth(res: VercelResponse): void {
  res.status(200).json({
    status: 'healthy',
    server: 'kobana-mcp-unified',
    version: '1.0.0',
    activeSessions: activeTransports.size,
    namespaces: namespaces.map(ns => ns.name),
  });
}

function handleInfo(res: VercelResponse): void {
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

  res.status(200).json({
    name: 'kobana-mcp-unified',
    version: '1.0.0',
    description: 'Unified Kobana MCP Server for all namespaces',
    namespaces: namespacesInfo,
    totalTools: namespaces.reduce((sum, ns) => sum + getToolsForNamespace(ns.name).length, 0),
  });
}

function handleNamespaceInfo(ns: NamespaceConfig, res: VercelResponse): void {
  const tools = getToolsForNamespace(ns.name);

  res.status(200).json({
    name: `kobana-mcp-${ns.name}`,
    version: '1.0.0',
    description: ns.description,
    endpoints: {
      sse: `${ns.path}/sse`,
      messages: `${ns.path}/messages`,
      health: '/health',
    },
    tools: tools.map(t => t.name),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const pathname = req.url?.split('?')[0] || '/';

  try {
    if (pathname === '/health' && req.method === 'GET') {
      handleHealth(res);
      return;
    }

    if ((pathname === '/' || pathname === '/api' || pathname === '/api/') && req.method === 'GET') {
      handleInfo(res);
      return;
    }

    const ns = getNamespaceByPath(pathname);
    if (ns) {
      const subpath = pathname.slice(ns.path.length);

      if (subpath === '' || subpath === '/') {
        handleNamespaceInfo(ns, res);
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

    res.status(404).json({ error: 'Not found', path: pathname });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
