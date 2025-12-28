#!/usr/bin/env node

import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './server.js';
import { getConfig, Config } from './config.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

interface ActiveTransport {
  transport: SSEServerTransport;
  response: ServerResponse;
}

const activeTransports = new Map<string, ActiveTransport>();

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function parseConfig(req: IncomingMessage): Config | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return {
      apiUrl: (req.headers['x-kobana-api-url'] as string) || 'https://api.kobana.com.br',
      accessToken: token,
    };
  }

  try {
    return getConfig();
  } catch {
    return null;
  }
}

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kobana-Api-Url');
  res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
}

async function handleSSE(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const config = parseConfig(req);
  if (!config) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing or invalid authorization' }));
    return;
  }

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
    server: 'kobana-mcp-payment',
    version: '1.0.0',
    activeSessions: activeTransports.size,
  }));
}

function handleInfo(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'kobana-mcp-payment',
    version: '1.0.0',
    description: 'MCP Server for Kobana Payment API v2 (Bank billets, Pix, DARF, Taxes, Utilities)',
    endpoints: {
      sse: '/sse',
      messages: '/messages',
      health: '/health',
    },
    tools: [
      'list_payment_bank_billets',
      'create_payment_bank_billet',
      'get_payment_bank_billet',
      'list_payment_pix',
      'create_payment_pix',
      'get_payment_pix',
      'list_payment_darfs',
      'create_payment_darf',
      'get_payment_darf',
      'list_payment_taxes',
      'create_payment_tax',
      'get_payment_tax',
      'list_payment_utilities',
      'create_payment_utility',
      'get_payment_utility',
      'list_payment_batches',
      'get_payment_batch',
      'approve_payment_batch',
      'reprove_payment_batch',
      'create_payment_bank_billet_batch',
      'create_payment_pix_batch',
      'create_payment_darf_batch',
      'create_payment_tax_batch',
      'create_payment_utility_batch',
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
  console.log(`Kobana MCP Payment Server (HTTP) running on http://${HOST}:${PORT}`);
  console.log('Endpoints:');
  console.log(`  SSE:      GET  http://${HOST}:${PORT}/sse`);
  console.log(`  Messages: POST http://${HOST}:${PORT}/messages?sessionId=<id>`);
  console.log(`  Health:   GET  http://${HOST}:${PORT}/health`);
  console.log(`  Info:     GET  http://${HOST}:${PORT}/`);
});
