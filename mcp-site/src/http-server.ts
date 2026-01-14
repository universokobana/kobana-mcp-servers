import http from 'node:http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './server.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

interface ActiveTransport {
  transport: SSEServerTransport;
  response: http.ServerResponse;
}

const activeSessions = new Map<string, ActiveTransport>();

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function setCorsHeaders(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kobana-Api-Url');
}

const httpServer = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // Health check endpoint
  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'kobana-mcp-site' }));
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
          sse: '/sse',
          messages: '/messages',
          health: '/health',
        },
      })
    );
    return;
  }

  // SSE endpoint for establishing connection
  if (url.pathname === '/sse' && req.method === 'GET') {
    const sessionId = generateSessionId();

    console.error(`[HTTP] New SSE connection: ${sessionId}`);

    const server = createServer();
    const transport = new SSEServerTransport('/messages', res);

    activeSessions.set(sessionId, { transport, response: res });

    // Clean up on connection close
    res.on('close', () => {
      console.error(`[HTTP] SSE connection closed: ${sessionId}`);
      activeSessions.delete(sessionId);
    });

    await server.connect(transport);
    return;
  }

  // Messages endpoint for receiving client messages
  if (url.pathname === '/messages' && req.method === 'POST') {
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing sessionId parameter' }));
      return;
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    // Read request body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const body = Buffer.concat(chunks).toString('utf-8');

    try {
      await session.transport.handlePostMessage(req, res, body);
    } catch (error) {
      console.error(`[HTTP] Error handling message for ${sessionId}:`, error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

httpServer.listen(PORT, HOST, () => {
  console.error(`Kobana MCP Site Server running on http://${HOST}:${PORT}`);
  console.error(`SSE endpoint: http://${HOST}:${PORT}/sse`);
  console.error(`Health check: http://${HOST}:${PORT}/health`);
});
