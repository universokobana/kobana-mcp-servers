import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Loopback by default: this is a local debugging server, not something meant to
// be reachable from the network. Override HOST deliberately.
const HOST = process.env.HOST || '127.0.0.1';

// Browser origins permitted to call this server (comma-separated). Empty by
// default: no cross-origin caller is trusted.
function getAllowedOrigins(): string[] {
  const raw = process.env.MCP_ALLOWED_ORIGINS;
  if (!raw) {
    return [];
  }
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Validate the Origin header before doing any work. The MCP spec requires this
// for local HTTP transports, so a page the developer happens to visit cannot
// reach this port from their browser and drive tool calls. Returns true when
// the request has already been answered and the caller should stop.
function rejectDisallowedOrigin(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  const origin = req.headers.origin;

  // No Origin means a non-browser client (curl, an MCP stdio bridge). There is
  // nothing to validate.
  if (typeof origin !== 'string' || origin.length === 0) {
    return false;
  }

  if (getAllowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Protocol-Version');
    return false;
  }

  res.writeHead(403, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'forbidden',
    error_description: `Origin "${origin}" is not allowed. Set MCP_ALLOWED_ORIGINS to permit it.`,
  }));
  return true;
}

// A fresh server and transport per request, with session management disabled —
// no state survives a request, so there is no session identifier for a third
// party to guess or reuse.
async function handleMcp(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } finally {
    await transport.close();
    await server.close();
  }
}

const httpServer = http.createServer(async (req, res) => {
  if (rejectDisallowedOrigin(req, res)) {
    return;
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  try {
    // Health check endpoint
    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', server: 'kobana-mcp-site', transport: 'streamable-http' }));
      return;
    }

    // Server info endpoint
    if (url.pathname === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          name: 'kobana-mcp-site',
          version: '1.0.0',
          description: 'MCP server for searching and reading Kobana website content',
          endpoints: {
            mcp: '/mcp',
            health: '/health',
          },
        })
      );
      return;
    }

    // MCP endpoint
    if (url.pathname === '/mcp') {
      await handleMcp(req, res);
      return;
    }

    // The SSE transport this server used to expose has been removed.
    if (url.pathname === '/sse' || url.pathname === '/messages') {
      res.writeHead(410, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'gone',
        error_description: 'The SSE transport was removed. Use POST /mcp (Streamable HTTP) instead.',
      }));
      return;
    }

    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('[HTTP] Request error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.error(`Kobana MCP Site Server running on http://${HOST}:${PORT}`);
  console.error(`MCP endpoint: http://${HOST}:${PORT}/mcp`);
  console.error(`Health check: http://${HOST}:${PORT}/health`);
});
