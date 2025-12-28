import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

function createMcpServer(namespace: string, config: Config): McpServer {
  const tools = getToolsForNamespace(namespace);
  const apiClient = getApiClientForNamespace(namespace, config);

  const server = new McpServer({
    name: `kobana-mcp-${namespace}`,
    version: '1.0.0',
  });

  // Register all tools for this namespace
  for (const tool of tools) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema instanceof z.ZodObject ? tool.inputSchema.shape : {},
      async (args: unknown) => {
        try {
          const result = await tool.handler(apiClient, args);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ error: errorMessage }) }],
            isError: true,
          };
        }
      }
    );
  }

  return server;
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kobana-Api-Url, mcp-session-id, mcp-protocol-version');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id, mcp-protocol-version');
}

async function handleMcp(req: VercelRequest, res: VercelResponse, ns: NamespaceConfig): Promise<void> {
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

  // Create a new server and transport for each request (stateless mode)
  const server = createMcpServer(ns.name, config);

  // Stateless transport - no session management
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  });

  // Connect server to transport
  await server.connect(transport);

  try {
    // Handle the request
    await transport.handleRequest(
      req as unknown as import('http').IncomingMessage,
      res as unknown as import('http').ServerResponse,
      req.body
    );
  } finally {
    // Clean up after request
    await transport.close();
    await server.close();
  }
}

function handleHealth(res: VercelResponse): void {
  res.status(200).json({
    status: 'healthy',
    server: 'kobana-mcp-unified',
    version: '1.0.0',
    transport: 'streamable-http',
    namespaces: namespaces.map(ns => ns.name),
  });
}

function handleInfo(res: VercelResponse): void {
  const namespacesInfo = namespaces.map(ns => ({
    name: ns.name,
    path: ns.path,
    description: ns.description,
    endpoints: {
      mcp: `${ns.path}/mcp`,
    },
    tools: getToolsForNamespace(ns.name).map(t => t.name),
  }));

  res.status(200).json({
    name: 'kobana-mcp-unified',
    version: '1.0.0',
    description: 'Unified Kobana MCP Server for all namespaces',
    transport: 'streamable-http',
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
    transport: 'streamable-http',
    endpoints: {
      mcp: `${ns.path}/mcp`,
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
    // Health endpoint
    if (pathname === '/health' && req.method === 'GET') {
      handleHealth(res);
      return;
    }

    // Root info endpoint
    if ((pathname === '/' || pathname === '/api' || pathname === '/api/') && req.method === 'GET') {
      handleInfo(res);
      return;
    }

    // Namespace endpoints
    const ns = getNamespaceByPath(pathname);
    if (ns) {
      const subpath = pathname.slice(ns.path.length);

      // Namespace info
      if (subpath === '' || subpath === '/') {
        handleNamespaceInfo(ns, res);
        return;
      }

      // MCP endpoint - handles both GET and POST for Streamable HTTP
      if (subpath === '/mcp') {
        await handleMcp(req, res, ns);
        return;
      }
    }

    res.status(404).json({ error: 'Not found', path: pathname });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
