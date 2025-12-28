import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createHash, randomUUID } from 'crypto';
import { Redis } from 'ioredis';

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

// ============================================================================
// OAuth 2.1 Implementation
// ============================================================================

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  kobanaAppUrl: string;
  mcpServerUrl: string;
}

interface PendingAuth {
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
  clientId: string;
  state: string;
  kobanaState: string;
  createdAt: number;
}

interface AuthCode {
  kobanaToken: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
  createdAt: number;
}

interface ActiveSession {
  kobanaToken: string;
  createdAt: number;
}

// TTL constants (in seconds for Redis)
const PENDING_AUTH_TTL = 10 * 60; // 10 minutes
const AUTH_CODE_TTL = 5 * 60; // 5 minutes
const SESSION_TTL = 24 * 60 * 60; // 24 hours

// Redis client singleton
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null;

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redisClient;
}

function isRedisConfigured(): boolean {
  return !!process.env.REDIS_URL;
}

function getEnvironment(): string {
  return process.env.APP_ENVIRONMENT || 'production';
}

// Redis key prefixes (environment-scoped)
function getRedisPrefix() {
  const env = getEnvironment();
  return {
    pendingAuth: `mcp:${env}:pending:`,
    authCode: `mcp:${env}:code:`,
    session: `mcp:${env}:session:`,
  };
}

// Storage functions with Redis support
async function storePendingAuth(kobanaState: string, auth: PendingAuth): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    await redis.setex(
      prefix.pendingAuth + kobanaState,
      PENDING_AUTH_TTL,
      JSON.stringify(auth)
    );
  }
}

async function getPendingAuth(kobanaState: string): Promise<PendingAuth | null> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    const data = await redis.get(prefix.pendingAuth + kobanaState);
    if (data) {
      return JSON.parse(data) as PendingAuth;
    }
  }
  return null;
}

async function deletePendingAuth(kobanaState: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    await redis.del(prefix.pendingAuth + kobanaState);
  }
}

async function storeAuthCode(code: string, authCode: AuthCode): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    await redis.setex(
      prefix.authCode + code,
      AUTH_CODE_TTL,
      JSON.stringify(authCode)
    );
  }
}

async function getAuthCode(code: string): Promise<AuthCode | null> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    const data = await redis.get(prefix.authCode + code);
    if (data) {
      return JSON.parse(data) as AuthCode;
    }
  }
  return null;
}

async function deleteAuthCode(code: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    await redis.del(prefix.authCode + code);
  }
}

async function storeSession(mcpToken: string, session: ActiveSession): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    await redis.setex(
      prefix.session + mcpToken,
      SESSION_TTL,
      JSON.stringify(session)
    );
  }
}

async function getSession(mcpToken: string): Promise<ActiveSession | null> {
  const redis = getRedisClient();
  if (redis) {
    const prefix = getRedisPrefix();
    const data = await redis.get(prefix.session + mcpToken);
    if (data) {
      return JSON.parse(data) as ActiveSession;
    }
  }
  return null;
}

function isOAuthConfigured(): boolean {
  return !!(process.env.KOBANA_OAUTH_CLIENT_ID && process.env.KOBANA_OAUTH_CLIENT_SECRET);
}

function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.KOBANA_OAUTH_CLIENT_ID;
  const clientSecret = process.env.KOBANA_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('OAuth not configured');
  }

  return {
    clientId,
    clientSecret,
    kobanaAppUrl: process.env.KOBANA_APP_URL || 'https://app.kobana.com.br',
    mcpServerUrl: process.env.MCP_SERVER_URL || 'https://mcp.kobana.com.br',
  };
}

function generateState(): string {
  return randomUUID();
}

function generateCode(): string {
  return randomUUID();
}

function generateToken(): string {
  return `mcp_${randomUUID().replace(/-/g, '')}`;
}

function validatePKCE(codeVerifier: string, codeChallenge: string, method: string): boolean {
  if (method !== 'S256') return false;
  if (codeVerifier.length < 43 || codeVerifier.length > 128) return false;
  if (!/^[A-Za-z0-9\-._~]+$/.test(codeVerifier)) return false;

  const hash = createHash('sha256').update(codeVerifier, 'ascii').digest();
  const expectedChallenge = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return expectedChallenge === codeChallenge;
}

async function getKobanaTokenFromMcpToken(mcpToken: string): Promise<string | undefined> {
  const session = await getSession(mcpToken);
  if (session) {
    return session.kobanaToken;
  }
  return undefined;
}

async function getConfig(authHeader: string | null, apiUrlHeader: string | null): Promise<Config> {
  let accessToken = process.env.KOBANA_ACCESS_TOKEN || '';

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const token = parts[1];

      // Check if this is an MCP OAuth token
      if (token.startsWith('mcp_')) {
        const kobanaToken = await getKobanaTokenFromMcpToken(token);
        if (kobanaToken) {
          accessToken = kobanaToken;
        } else {
          throw new Error('Invalid or expired MCP token');
        }
      } else {
        accessToken = token;
      }
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

// ============================================================================
// OAuth Handlers
// ============================================================================

function handleOAuthMetadata(res: VercelResponse): void {
  const config = getOAuthConfig();
  const baseUrl = config.mcpServerUrl;

  res.status(200).json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    registration_endpoint: `${baseUrl}/register`,
    scopes_supported: ['login'],
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    service_documentation: 'https://developers.kobana.com.br',
  });
}

// RFC 9728 - OAuth 2.0 Protected Resource Metadata
function handleProtectedResourceMetadata(res: VercelResponse): void {
  const config = getOAuthConfig();
  const baseUrl = config.mcpServerUrl;

  res.status(200).json({
    resource: baseUrl,
    authorization_servers: [baseUrl],
    scopes_supported: ['login'],
    bearer_methods_supported: ['header'],
    resource_documentation: 'https://developers.kobana.com.br',
  });
}

// RFC 7591 - Dynamic Client Registration
async function handleDynamicClientRegistration(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Parse request body
  let body: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {
      res.status(400).json({ error: 'invalid_client_metadata', error_description: 'Invalid JSON body' });
      return;
    }
  } else if (req.body) {
    body = req.body;
  }

  const clientName = (body.client_name as string) || 'MCP Client';
  const redirectUris = (body.redirect_uris as string[]) || [];

  // Validate redirect_uris
  if (!redirectUris || redirectUris.length === 0) {
    res.status(400).json({ error: 'invalid_redirect_uri', error_description: 'redirect_uris is required' });
    return;
  }

  // Generate a unique client_id for this registration
  // In a real implementation, you'd store this in a database
  // For MCP, we accept any client and use the Kobana OAuth credentials server-side
  const clientId = `mcp_client_${randomUUID().replace(/-/g, '')}`;

  // Return client credentials
  // Note: client_secret is not required for public clients using PKCE
  res.status(201).json({
    client_id: clientId,
    client_name: clientName,
    redirect_uris: redirectUris,
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });
}

async function handleOAuthAuthorize(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Check if Redis is configured for OAuth
  if (!isRedisConfigured()) {
    res.status(503).json({ error: 'service_unavailable', error_description: 'OAuth requires Redis configuration (REDIS_URL)' });
    return;
  }

  const config = getOAuthConfig();

  const responseType = req.query.response_type as string;
  const clientId = req.query.client_id as string;
  const redirectUri = req.query.redirect_uri as string;
  const codeChallenge = req.query.code_challenge as string;
  const codeChallengeMethod = req.query.code_challenge_method as string;
  const state = req.query.state as string;

  // Validate required parameters
  if (responseType !== 'code') {
    res.status(400).json({ error: 'unsupported_response_type', error_description: 'Only response_type=code is supported' });
    return;
  }

  if (!redirectUri) {
    res.status(400).json({ error: 'invalid_request', error_description: 'redirect_uri is required' });
    return;
  }

  if (!codeChallenge || codeChallengeMethod !== 'S256') {
    res.status(400).json({ error: 'invalid_request', error_description: 'code_challenge with S256 method is required' });
    return;
  }

  if (!state) {
    res.status(400).json({ error: 'invalid_request', error_description: 'state is required' });
    return;
  }

  // Generate kobana state and store pending auth in Redis
  const kobanaState = generateState();

  await storePendingAuth(kobanaState, {
    codeChallenge,
    codeChallengeMethod,
    redirectUri,
    clientId: clientId || 'claude',
    state,
    kobanaState,
    createdAt: Date.now(),
  });

  // Redirect to Kobana OAuth
  const kobanaAuthUrl = new URL(`${config.kobanaAppUrl}/oauth/authorize`);
  kobanaAuthUrl.searchParams.set('client_id', config.clientId);
  kobanaAuthUrl.searchParams.set('redirect_uri', `${config.mcpServerUrl}/oauth/callback`);
  kobanaAuthUrl.searchParams.set('response_type', 'code');
  kobanaAuthUrl.searchParams.set('state', kobanaState);

  res.redirect(302, kobanaAuthUrl.toString());
}

async function handleOAuthCallback(req: VercelRequest, res: VercelResponse): Promise<void> {
  const kobanaCode = req.query.code as string;
  const kobanaState = req.query.state as string;
  const error = req.query.error as string;

  if (error) {
    res.status(400).send(`<html><body><h1>Authorization Failed</h1><p>${error}</p></body></html>`);
    return;
  }

  if (!kobanaState) {
    res.status(400).json({ error: 'invalid_request', error_description: 'Missing state' });
    return;
  }

  // Get pending auth from Redis (TTL is handled by Redis)
  const pendingAuth = await getPendingAuth(kobanaState);
  if (!pendingAuth) {
    res.status(400).json({ error: 'invalid_request', error_description: 'Invalid or expired state' });
    return;
  }

  if (!kobanaCode) {
    res.status(400).json({ error: 'invalid_request', error_description: 'Missing authorization code' });
    return;
  }

  try {
    const config = getOAuthConfig();

    // Exchange Kobana code for token
    const tokenUrl = `${config.kobanaAppUrl}/oauth/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: kobanaCode,
      redirect_uri: `${config.mcpServerUrl}/oauth/callback`,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Kobana token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as { access_token: string };

    // Clean up pending auth from Redis
    await deletePendingAuth(kobanaState);

    // Create MCP authorization code and store in Redis
    const mcpCode = generateCode();
    await storeAuthCode(mcpCode, {
      kobanaToken: tokenData.access_token,
      codeChallenge: pendingAuth.codeChallenge,
      codeChallengeMethod: pendingAuth.codeChallengeMethod,
      redirectUri: pendingAuth.redirectUri,
      createdAt: Date.now(),
    });

    // Redirect to client's callback
    const redirectUrl = new URL(pendingAuth.redirectUri);
    redirectUrl.searchParams.set('code', mcpCode);
    redirectUrl.searchParams.set('state', pendingAuth.state);

    res.redirect(302, redirectUrl.toString());
  } catch (err) {
    console.error('OAuth callback error:', err);
    await deletePendingAuth(kobanaState);
    res.status(500).send('<html><body><h1>Authorization Failed</h1><p>Failed to complete authorization</p></body></html>');
  }
}

async function handleOAuthToken(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Parse body
  let body: Record<string, string> = {};
  if (typeof req.body === 'string') {
    body = Object.fromEntries(new URLSearchParams(req.body));
  } else if (req.body) {
    body = req.body;
  }

  const grantType = body.grant_type;
  const code = body.code;
  const codeVerifier = body.code_verifier;
  const redirectUri = body.redirect_uri;

  if (grantType !== 'authorization_code') {
    res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Only authorization_code is supported' });
    return;
  }

  if (!code) {
    res.status(400).json({ error: 'invalid_request', error_description: 'code is required' });
    return;
  }

  if (!codeVerifier) {
    res.status(400).json({ error: 'invalid_request', error_description: 'code_verifier is required' });
    return;
  }

  // Get auth code from Redis (TTL is handled by Redis)
  const authCode = await getAuthCode(code);
  if (!authCode) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' });
    return;
  }

  // Validate redirect_uri
  if (redirectUri && redirectUri !== authCode.redirectUri) {
    await deleteAuthCode(code);
    res.status(400).json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' });
    return;
  }

  // Validate PKCE
  if (!validatePKCE(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
    await deleteAuthCode(code);
    res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid code_verifier' });
    return;
  }

  // Delete auth code (single use)
  await deleteAuthCode(code);

  // Create MCP session in Redis
  const mcpToken = generateToken();
  await storeSession(mcpToken, {
    kobanaToken: authCode.kobanaToken,
    createdAt: Date.now(),
  });

  res.status(200).json({
    access_token: mcpToken,
    token_type: 'Bearer',
    scope: 'login',
  });
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
    config = await getConfig(
      req.headers.authorization || null,
      (req.headers['x-kobana-api-url'] as string) || null
    );
  } catch {
    // If OAuth is configured, return 401 with WWW-Authenticate to trigger OAuth flow
    if (isOAuthConfigured()) {
      const oauthConfig = getOAuthConfig();
      const prmUrl = `${oauthConfig.mcpServerUrl}/.well-known/oauth-protected-resource`;
      // MCP spec requires resource_metadata in WWW-Authenticate header
      res.setHeader('WWW-Authenticate', `Bearer resource_metadata="${prmUrl}"`);
      res.status(401).json({ error: 'unauthorized', error_description: 'Authentication required' });
    } else {
      res.status(401).json({ error: 'Missing or invalid authorization' });
    }
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
      environment: getEnvironment(),
      redis_configured: isRedisConfigured(),
      metadata_endpoint: '/.well-known/oauth-authorization-server',
      authorization_endpoint: '/authorize',
      token_endpoint: '/token',
    };
  }

  res.status(200).json(response);
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
    // OAuth endpoints (only if configured)
    if (isOAuthConfigured()) {
      if (pathname === '/.well-known/oauth-authorization-server' && req.method === 'GET') {
        handleOAuthMetadata(res);
        return;
      }

      // RFC 9728 - Protected Resource Metadata
      if (pathname === '/.well-known/oauth-protected-resource' && req.method === 'GET') {
        handleProtectedResourceMetadata(res);
        return;
      }

      if (pathname === '/authorize' && req.method === 'GET') {
        await handleOAuthAuthorize(req, res);
        return;
      }

      if (pathname === '/oauth/callback' && req.method === 'GET') {
        await handleOAuthCallback(req, res);
        return;
      }

      if (pathname === '/token' && req.method === 'POST') {
        await handleOAuthToken(req, res);
        return;
      }

      // RFC 7591 - Dynamic Client Registration
      if (pathname === '/register' && req.method === 'POST') {
        await handleDynamicClientRegistration(req, res);
        return;
      }
    }

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
