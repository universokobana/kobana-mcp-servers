#!/usr/bin/env node

// Load environment variables from .env in development.
// dotenv is a no-op in production environments where vars are already set
// (Vercel, systemd, container orchestrators, etc.) — it never overwrites
// existing process.env values.
import 'dotenv/config';

import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getConfigFromEnv, Config } from './config.js';
import { namespaces, getNamespaceByPath, NamespaceConfig } from './namespaces.js';

// OAuth imports
import {
  isOAuthConfigured,
  handleAuthorizationServerMetadata,
  handleProtectedResourceMetadata,
  handleAuthorize,
  handleKobanaCallback,
  handleToken,
  handleRegister,
  getKobanaTokenFromMcpToken,
  getOAuthConfig,
} from './oauth/index.js';
import { getKobanaApiBaseUrl } from './oauth/config.js';

// Import tools from each MCP package
import { allTools as adminTools } from '../../mcp-admin/dist/tools/index.js';
import { allTools as chargeTools } from '../../mcp-charge/dist/tools/index.js';
import { allTools as dataTools } from '../../mcp-data/dist/tools/index.js';
import { allTools as ediTools } from '../../mcp-edi/dist/tools/index.js';
import { allTools as financialTools } from '../../mcp-financial/dist/tools/index.js';
import { allTools as paymentTools } from '../../mcp-payment/dist/tools/index.js';
import { allTools as transferTools } from '../../mcp-transfer/dist/tools/index.js';
import { allTools as mailboxTools } from '../../mcp-mailbox/dist/tools/index.js';

// Import API clients from each MCP package
import { KobanaApiClient as AdminApiClient } from '../../mcp-admin/dist/api/client.js';
import { KobanaApiClient as ChargeApiClient } from '../../mcp-charge/dist/api/client.js';
import { KobanaApiClient as DataApiClient } from '../../mcp-data/dist/api/client.js';
import { KobanaApiClient as EdiApiClient } from '../../mcp-edi/dist/api/client.js';
import { KobanaApiClient as FinancialApiClient } from '../../mcp-financial/dist/api/client.js';
import { KobanaApiClient as PaymentApiClient } from '../../mcp-payment/dist/api/client.js';
import { KobanaApiClient as TransferApiClient } from '../../mcp-transfer/dist/api/client.js';
import { KobanaApiClient as MailboxApiClient } from '../../mcp-mailbox/dist/api/client.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (client: unknown, args: unknown) => Promise<unknown>;
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
    case 'mailbox': return mailboxTools as ToolDefinition[];
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
    case 'mailbox': return new MailboxApiClient(config);
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Kobana-Api-Url, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id, WWW-Authenticate');
}

/**
 * Resolves configuration from request.
 * Supports:
 * 1. Direct Kobana token via Authorization header
 * 2. MCP OAuth token (prefixed with "mcp_") which resolves to Kobana token
 * 3. Environment variable fallback (only when OAuth is not configured)
 */
function resolveConfig(req: IncomingMessage): Config | null {
  const authHeader = req.headers.authorization || null;
  const apiUrlHeader = (req.headers['x-kobana-api-url'] as string) || null;

  // Check for Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // Check if this is an MCP OAuth token
    if (token.startsWith('mcp_')) {
      const kobanaToken = getKobanaTokenFromMcpToken(token);
      if (!kobanaToken) {
        return null;
      }
      return {
        apiUrl: apiUrlHeader || getKobanaApiBaseUrl(),
        accessToken: kobanaToken,
      };
    }

    // Direct Kobana token
    return {
      apiUrl: apiUrlHeader || getKobanaApiBaseUrl(),
      accessToken: token,
    };
  }

  // Fallback to environment config (dev / single-tenant)
  if (!isOAuthConfigured()) {
    try {
      return getConfigFromEnv();
    } catch {
      return null;
    }
  }

  return null;
}

function getServerBaseUrl(req: IncomingMessage): string {
  if (isOAuthConfigured()) {
    return getOAuthConfig().mcpServerUrl;
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const host = req.headers.host || `${HOST}:${PORT}`;
  return `${proto}://${host}`;
}

function sendUnauthorized(req: IncomingMessage, res: ServerResponse, ns: NamespaceConfig): void {
  const baseUrl = getServerBaseUrl(req);
  const resourceMetadataUrl = `${baseUrl}/.well-known/oauth-protected-resource${ns.path}/mcp`;

  res.writeHead(401, {
    'Content-Type': 'application/json',
    'WWW-Authenticate': `Bearer realm="${baseUrl}", resource_metadata="${resourceMetadataUrl}"`,
  });
  res.end(
    JSON.stringify({
      error: 'unauthorized',
      error_description: 'Authentication required. Use the OAuth flow advertised in WWW-Authenticate.',
    })
  );
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function handleMcp(
  req: IncomingMessage,
  res: ServerResponse,
  ns: NamespaceConfig
): Promise<void> {
  const config = resolveConfig(req);
  if (!config) {
    sendUnauthorized(req, res, ns);
    return;
  }

  // Stateless mode: spin up a fresh transport+server for each request.
  // This works well for serverless deployments (Vercel, Cloudflare, etc.).
  const server = createMcpServer(ns.name, config);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  await server.connect(transport);

  let parsedBody: unknown = undefined;
  if (req.method === 'POST') {
    parsedBody = await readJsonBody(req);
  }

  await transport.handleRequest(req, res, parsedBody);
}

function handleHealth(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'healthy',
      server: 'kobana-mcp-unified',
      version: '1.0.0',
      transport: 'streamable-http',
      namespaces: namespaces.map((ns) => ns.name),
    })
  );
}

function handleInfo(req: IncomingMessage, res: ServerResponse): void {
  const baseUrl = getServerBaseUrl(req);

  const namespacesInfo = namespaces.map((ns) => ({
    name: ns.name,
    path: ns.path,
    description: ns.description,
    endpoint: `${baseUrl}${ns.path}/mcp`,
    tools: getToolsForNamespace(ns.name).map((t) => t.name),
  }));

  const response: Record<string, unknown> = {
    name: 'kobana-mcp-unified',
    version: '1.0.0',
    description: 'Unified Kobana MCP Server for all namespaces',
    transport: 'streamable-http',
    namespaces: namespacesInfo,
    totalTools: namespaces.reduce((sum, ns) => sum + getToolsForNamespace(ns.name).length, 0),
  };

  if (isOAuthConfigured()) {
    response.oauth = {
      enabled: true,
      authorization_server_metadata: `${baseUrl}/.well-known/oauth-authorization-server`,
      protected_resource_metadata: `${baseUrl}/.well-known/oauth-protected-resource`,
      registration_endpoint: `${baseUrl}/register`,
      authorization_endpoint: `${baseUrl}/authorize`,
      token_endpoint: `${baseUrl}/token`,
    };
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response, null, 2));
}

function handleNamespaceInfo(
  ns: NamespaceConfig,
  req: IncomingMessage,
  res: ServerResponse
): void {
  const baseUrl = getServerBaseUrl(req);
  const tools = getToolsForNamespace(ns.name);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify(
      {
        name: `kobana-mcp-${ns.name}`,
        version: '1.0.0',
        description: ns.description,
        endpoint: `${baseUrl}${ns.path}/mcp`,
        transport: 'streamable-http',
        tools: tools.map((t) => t.name),
      },
      null,
      2
    )
  );
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
    // OAuth discovery + endpoints (only if configured)
    if (isOAuthConfigured()) {
      // RFC 8414 — Authorization Server Metadata.
      // Some clients append the resource path; we accept both forms.
      if (
        req.method === 'GET' &&
        (pathname === '/.well-known/oauth-authorization-server' ||
          pathname.startsWith('/.well-known/oauth-authorization-server/'))
      ) {
        handleAuthorizationServerMetadata(req, res);
        return;
      }

      // RFC 9728 — Protected Resource Metadata.
      // Clients construct this URL by inserting the resource path between the
      // well-known prefix and the resource. Match any sub-path.
      if (
        req.method === 'GET' &&
        (pathname === '/.well-known/oauth-protected-resource' ||
          pathname.startsWith('/.well-known/oauth-protected-resource/'))
      ) {
        handleProtectedResourceMetadata(req, res);
        return;
      }

      if (pathname === '/authorize' && req.method === 'GET') {
        handleAuthorize(req, res);
        return;
      }

      if (pathname === '/oauth/callback' && req.method === 'GET') {
        await handleKobanaCallback(req, res);
        return;
      }

      if (pathname === '/token' && req.method === 'POST') {
        await handleToken(req, res);
        return;
      }

      if (pathname === '/register' && req.method === 'POST') {
        await handleRegister(req, res);
        return;
      }
    }

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

      if (subpath === '/mcp') {
        if (req.method === 'POST' || req.method === 'GET' || req.method === 'DELETE') {
          await handleMcp(req, res, ns);
          return;
        }

        res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'GET, POST, DELETE' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
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
  console.log('Available namespaces (Streamable HTTP):');
  for (const ns of namespaces) {
    console.log(`  ${ns.name.padEnd(12)} ${ns.path}/mcp`);
  }
  console.log('');
  console.log('Global endpoints:');
  console.log(`  Health:    GET  http://${HOST}:${PORT}/health`);
  console.log(`  Info:      GET  http://${HOST}:${PORT}/`);

  if (isOAuthConfigured()) {
    console.log('');
    console.log('OAuth 2.1 endpoints:');
    console.log(`  AS metadata: GET  http://${HOST}:${PORT}/.well-known/oauth-authorization-server`);
    console.log(`  PR metadata: GET  http://${HOST}:${PORT}/.well-known/oauth-protected-resource`);
    console.log(`  Register:    POST http://${HOST}:${PORT}/register`);
    console.log(`  Authorize:   GET  http://${HOST}:${PORT}/authorize`);
    console.log(`  Token:       POST http://${HOST}:${PORT}/token`);
  } else {
    console.log('');
    console.log('OAuth: Not configured (set KOBANA_OAUTH_CLIENT_ID and KOBANA_OAUTH_CLIENT_SECRET to enable)');
  }
});

export { httpServer };
