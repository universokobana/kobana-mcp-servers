#!/usr/bin/env node
import { createServer as createHttpServer } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';
import { getConfig } from './config.js';
const PORT = parseInt(process.env.PORT || '3008', 10);
// Loopback by default. This is a local debugging server that will fall back to
// the credentials in its own environment, so binding it to 0.0.0.0 would let
// anything routable to this host spend that token. Override HOST deliberately.
const HOST = process.env.HOST || '127.0.0.1';
// Browser origins permitted to call this server (comma-separated). Empty by
// default: no cross-origin caller is trusted.
function getAllowedOrigins() {
    const raw = process.env.MCP_ALLOWED_ORIGINS;
    if (!raw) {
        return [];
    }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
}
// Hostname allowlist for X-Kobana-Help-Url. Defaults to *.kobana.com.br.
// Override with KOBANA_HELP_URL_ALLOWLIST (comma-separated; entries starting
// with "." match any subdomain).
function getAllowedHelpUrlHosts() {
    const raw = process.env.KOBANA_HELP_URL_ALLOWLIST;
    if (raw) {
        return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    }
    return ['.kobana.com.br'];
}
function hostMatchesPattern(hostname, pattern) {
    if (pattern.startsWith('.')) {
        const bare = pattern.slice(1);
        return hostname === bare || hostname.endsWith(pattern);
    }
    return hostname === pattern;
}
// Validate X-Kobana-Help-Url. Without this guard the header is a SSRF vector:
// an attacker pointing it at a private IP, cloud metadata endpoint, or any
// third-party host would have the server fetch from that origin. Returns null
// on success or an error description on failure.
function validateHelpUrl(rawUrl) {
    let url;
    try {
        url = new URL(rawUrl);
    }
    catch {
        return 'X-Kobana-Help-Url must be a valid absolute URL';
    }
    if (url.protocol.toLowerCase() !== 'https:') {
        return 'X-Kobana-Help-Url must use https://';
    }
    const hostname = url.hostname.toLowerCase();
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
        /^\[?[0-9a-f:]+\]?$/.test(hostname.replace(/^\[|\]$/g, ''))) {
        return 'X-Kobana-Help-Url must use a hostname, not an IP literal';
    }
    const allowlist = getAllowedHelpUrlHosts();
    if (!allowlist.some(p => hostMatchesPattern(hostname, p))) {
        return `X-Kobana-Help-Url host "${hostname}" is not in the allowed help hosts list`;
    }
    return null;
}
function parseConfig(req) {
    const helpUrl = req.headers['x-kobana-help-url'];
    const locale = req.headers['x-kobana-help-locale'];
    const config = getConfig();
    return {
        helpCenterUrl: helpUrl || config.helpCenterUrl,
        locale: locale || config.locale,
    };
}
// Validate the Origin header before doing any work. The MCP spec requires this
// for local HTTP transports: without it, any page the developer happens to
// visit can reach this port from their browser and drive tool calls under
// whatever credentials this process holds. Returns true when the request has
// already been answered and the caller should stop.
function rejectDisallowedOrigin(req, res) {
    const origin = req.headers.origin;
    // No Origin means a non-browser client (curl, an MCP stdio bridge). There is
    // nothing to validate and no ambient-credential risk to guard against.
    if (typeof origin !== 'string' || origin.length === 0) {
        return false;
    }
    if (getAllowedOrigins().includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Protocol-Version, X-Kobana-Help-Url, X-Kobana-Help-Locale');
        return false;
    }
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        error: 'forbidden',
        error_description: `Origin "${origin}" is not allowed. Set MCP_ALLOWED_ORIGINS to permit it.`,
    }));
    return true;
}
// A fresh server and transport per request, with session management disabled.
// Every request therefore carries its own credentials and no state survives it
// — there is no session identifier for a third party to guess or reuse.
async function handleMcp(req, res) {
    const helpUrlHeader = req.headers['x-kobana-help-url'];
    if (typeof helpUrlHeader === 'string' && helpUrlHeader.length > 0) {
        const error = validateHelpUrl(helpUrlHeader);
        if (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'invalid_request', error_description: error }));
            return;
        }
    }
    const config = parseConfig(req);
    const server = createServer(config);
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
        enableJsonResponse: true,
    });
    try {
        await server.connect(transport);
        await transport.handleRequest(req, res);
    }
    finally {
        await transport.close();
        await server.close();
    }
}
function handleHealth(_req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'healthy',
        server: 'kobana-mcp-help',
        version: '1.0.0',
        transport: 'streamable-http',
    }));
}
function handleInfo(_req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        name: 'kobana-mcp-help',
        version: '1.0.0',
        description: 'MCP Server for Kobana Help Center',
        endpoints: {
            mcp: '/mcp',
            health: '/health',
        },
        tools: [
            'search_articles',
            'get_article',
        ],
    }));
}
const httpServer = createHttpServer(async (req, res) => {
    if (rejectDisallowedOrigin(req, res)) {
        return;
    }
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;
    try {
        if (pathname === '/mcp') {
            await handleMcp(req, res);
        }
        else if (pathname === '/health' && req.method === 'GET') {
            handleHealth(req, res);
        }
        else if (pathname === '/' && req.method === 'GET') {
            handleInfo(req, res);
        }
        else if (pathname === '/sse' || pathname === '/messages') {
            // The SSE transport this server used to expose has been removed.
            res.writeHead(410, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'gone',
                error_description: 'The SSE transport was removed. Use POST /mcp (Streamable HTTP) instead.',
            }));
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
    console.log(`Kobana MCP Help Server (HTTP) running on http://${HOST}:${PORT}`);
    console.log('Endpoints:');
    console.log(`  MCP:    POST http://${HOST}:${PORT}/mcp`);
    console.log(`  Health: GET  http://${HOST}:${PORT}/health`);
    console.log(`  Info:   GET  http://${HOST}:${PORT}/`);
});
//# sourceMappingURL=http-server.js.map