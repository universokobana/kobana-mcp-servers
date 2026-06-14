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

// Hostname allowlist for X-Kobana-Api-Url. Defaults to *.kobana.com.br.
// Override with KOBANA_API_URL_ALLOWLIST (comma-separated; entries starting
// with "." match any subdomain).
function getAllowedKobanaApiHosts(): string[] {
  const raw = process.env.KOBANA_API_URL_ALLOWLIST;
  if (raw) {
    return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }
  return ['.kobana.com.br'];
}

function hostMatchesPattern(hostname: string, pattern: string): boolean {
  if (pattern.startsWith('.')) {
    const bare = pattern.slice(1);
    return hostname === bare || hostname.endsWith(pattern);
  }
  return hostname === pattern;
}

// Validate X-Kobana-Api-Url. Without this guard the header is a SSRF vector:
// an attacker pointing it at a private IP, cloud metadata endpoint, or any
// third-party host would have the server proxy the request body and forward
// the response with the caller's bearer token attached. Returns null on
// success or an error description on failure.
function validateKobanaApiUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return 'X-Kobana-Api-Url must be a valid absolute URL';
  }

  if (url.protocol.toLowerCase() !== 'https:') {
    return 'X-Kobana-Api-Url must use https://';
  }

  const hostname = url.hostname.toLowerCase();

  // Refuse IP literals: the allowlist is hostname-based and IP literals
  // (including loopback / link-local / private ranges / 169.254.169.254
  // cloud metadata) bypass it. Clients pointing at IPs are almost certainly
  // attempting SSRF.
  if (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    /^\[?[0-9a-f:]+\]?$/.test(hostname.replace(/^\[|\]$/g, ''))
  ) {
    return 'X-Kobana-Api-Url must use a hostname, not an IP literal';
  }

  const allowlist = getAllowedKobanaApiHosts();
  if (!allowlist.some(p => hostMatchesPattern(hostname, p))) {
    return `X-Kobana-Api-Url host "${hostname}" is not in the allowed Kobana API hosts list`;
  }

  return null;
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
  const apiUrlHeader = req.headers['x-kobana-api-url'];
  if (typeof apiUrlHeader === 'string' && apiUrlHeader.length > 0) {
    const error = validateKobanaApiUrl(apiUrlHeader);
    if (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid_request', error_description: error }));
      return;
    }
  }

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
    server: 'kobana-mcp-mailbox',
    version: '1.0.0',
    activeSessions: activeTransports.size,
  }));
}

function handleInfo(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'kobana-mcp-mailbox',
    version: '1.0.0',
    description: 'MCP Server for Kobana Mailbox API v2',
    endpoints: {
      sse: '/sse',
      messages: '/messages',
      health: '/health',
    },
    tools: [
      'list_mailbox_entries',
      'get_mailbox_entry',
      'create_mailbox_entry',
      'update_mailbox_entry',
      'delete_mailbox_entry',
      'list_mailbox_files',
      'get_mailbox_file',
      'create_mailbox_file',
      'update_mailbox_file',
      'delete_mailbox_file',
      'get_mailbox_email_channel',
      'create_mailbox_email_channel',
      'update_mailbox_email_channel',
      'delete_mailbox_email_channel',
      'activate_mailbox_email_channel',
      'deactivate_mailbox_email_channel',
      'get_mailbox_s3_channel',
      'create_mailbox_s3_channel',
      'delete_mailbox_s3_channel',
      'activate_mailbox_s3_channel',
      'deactivate_mailbox_s3_channel',
      'update_mailbox_s3_credentials',
      'get_mailbox_sftp_channel',
      'create_mailbox_sftp_channel',
      'update_mailbox_sftp_channel',
      'delete_mailbox_sftp_channel',
      'activate_mailbox_sftp_channel',
      'deactivate_mailbox_sftp_channel',
      'fetch_mailbox_sftp_files',
      'update_mailbox_sftp_credentials',
      'get_mailbox_whatsapp_channel',
      'create_mailbox_whatsapp_channel',
      'update_mailbox_whatsapp_channel',
      'delete_mailbox_whatsapp_channel',
      'activate_mailbox_whatsapp_channel',
      'deactivate_mailbox_whatsapp_channel',
      'get_mailbox_syncthing_channel',
      'create_mailbox_syncthing_channel',
      'update_mailbox_syncthing_channel',
      'delete_mailbox_syncthing_channel',
      'activate_mailbox_syncthing_channel',
      'deactivate_mailbox_syncthing_channel',
      'resend_mailbox_syncthing_invites',
      'update_mailbox_syncthing_status',
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
  console.log(`Kobana MCP Mailbox Server (HTTP) running on http://${HOST}:${PORT}`);
  console.log('Endpoints:');
  console.log(`  SSE:      GET  http://${HOST}:${PORT}/sse`);
  console.log(`  Messages: POST http://${HOST}:${PORT}/messages?sessionId=<id>`);
  console.log(`  Health:   GET  http://${HOST}:${PORT}/health`);
  console.log(`  Info:     GET  http://${HOST}:${PORT}/`);
});
