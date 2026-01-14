#!/usr/bin/env node

import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './server.js';
import { getConfig, Config } from './config.js';

const PORT = parseInt(process.env.PORT || '3008', 10);
const HOST = process.env.HOST || '0.0.0.0';

interface ActiveTransport {
  transport: SSEServerTransport;
  response: ServerResponse;
}

const activeTransports = new Map<string, ActiveTransport>();

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function parseConfig(req: IncomingMessage): Config {
  const helpUrl = req.headers['x-kobana-help-url'] as string | undefined;
  const locale = req.headers['x-kobana-help-locale'] as string | undefined;

  const config = getConfig();

  return {
    helpCenterUrl: helpUrl || config.helpCenterUrl,
    locale: locale || config.locale,
  };
}

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Kobana-Help-Url, X-Kobana-Help-Locale');
  res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
}

async function handleSSE(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const config = parseConfig(req);
  const sessionId = generateSessionId();
  res.setHeader('X-Session-Id', sessionId);

  const server = createServer(config);
  const transport = new SSEServerTransport('/messages', res);

  activeTransports.set(sessionId, { transport, response: res });

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
    server: 'kobana-mcp-help',
    version: '1.0.0',
    activeSessions: activeTransports.size,
  }));
}

function handleInfo(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'kobana-mcp-help',
    version: '1.0.0',
    description: 'MCP Server for Kobana Help Center',
    endpoints: {
      sse: '/sse',
      messages: '/messages',
      health: '/health',
    },
    tools: [
      'search_articles',
      'get_article',
    ],
  }));
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
    if (pathname === '/sse' && req.method === 'GET') {
      await handleSSE(req, res);
    } else if (pathname === '/messages' && req.method === 'POST') {
      await handleMessage(req, res);
    } else if (pathname === '/health' && req.method === 'GET') {
      handleHealth(req, res);
    } else if (pathname === '/' && req.method === 'GET') {
      handleInfo(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Request error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Kobana MCP Help Server (HTTP) running on http://${HOST}:${PORT}`);
  console.log('Endpoints:');
  console.log(`  SSE:      GET  http://${HOST}:${PORT}/sse`);
  console.log(`  Messages: POST http://${HOST}:${PORT}/messages?sessionId=<id>`);
  console.log(`  Health:   GET  http://${HOST}:${PORT}/health`);
  console.log(`  Info:     GET  http://${HOST}:${PORT}/`);
});
