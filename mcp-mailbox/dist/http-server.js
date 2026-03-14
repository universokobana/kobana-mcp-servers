#!/usr/bin/env node
import { createServer as createHttpServer } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './server.js';
import { getConfig } from './config.js';
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const activeTransports = new Map();
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
function parseConfig(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return {
            apiUrl: req.headers['x-kobana-api-url'] || 'https://api.kobana.com.br',
            accessToken: token,
        };
    }
    try {
        return getConfig();
    }
    catch {
        return null;
    }
}
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kobana-Api-Url');
    res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
}
async function handleSSE(req, res) {
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
async function handleMessage(req, res) {
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    }
}
function handleHealth(_req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'healthy',
        server: 'kobana-mcp-mailbox',
        version: '1.0.0',
        activeSessions: activeTransports.size,
    }));
}
function handleInfo(_req, res) {
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
        }
        else if (pathname === '/messages' && req.method === 'POST') {
            await handleMessage(req, res);
        }
        else if (pathname === '/health' && req.method === 'GET') {
            handleHealth(req, res);
        }
        else if (pathname === '/' && req.method === 'GET') {
            handleInfo(req, res);
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    }
    catch (error) {
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
//# sourceMappingURL=http-server.js.map