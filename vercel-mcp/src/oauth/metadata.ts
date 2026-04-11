import { IncomingMessage, ServerResponse } from 'http';
import { getOAuthConfig, isOAuthConfigured } from './config.js';
import {
  getAllScopes,
  getScopesForNamespace,
  extractNamespaceFromResource,
} from './scopes.js';

/**
 * Handles GET /.well-known/oauth-authorization-server
 *
 * Returns OAuth 2.0 Authorization Server Metadata (RFC 8414).
 * This allows MCP clients (e.g., Claude Desktop) to discover authorization,
 * token, and registration endpoints.
 */
export function handleAuthorizationServerMetadata(
  _req: IncomingMessage,
  res: ServerResponse
): void {
  if (!isOAuthConfigured()) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OAuth not configured' }));
    return;
  }

  const config = getOAuthConfig();
  const baseUrl = config.mcpServerUrl;

  const metadata = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    registration_endpoint: `${baseUrl}/register`,
    scopes_supported: getAllScopes(),
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    service_documentation: 'https://developers.kobana.com.br',
  };

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=3600',
  });
  res.end(JSON.stringify(metadata, null, 2));
}

/**
 * Handles GET /.well-known/oauth-protected-resource[/{path}]
 *
 * Returns OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * This tells MCP clients which authorization server protects this resource,
 * which is the trigger for the OAuth discovery flow when a 401 response
 * carries a `WWW-Authenticate: Bearer resource_metadata="..."` header.
 *
 * Per RFC 9728 §3, clients construct the metadata URL by inserting
 * `/.well-known/oauth-protected-resource` between the resource origin and
 * the resource path. We accept both the bare well-known and any sub-path.
 */
export function handleProtectedResourceMetadata(
  req: IncomingMessage,
  res: ServerResponse
): void {
  if (!isOAuthConfigured()) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OAuth not configured' }));
    return;
  }

  const config = getOAuthConfig();
  const baseUrl = config.mcpServerUrl;

  // Derive the resource URL from the request path. If the client requested
  // /.well-known/oauth-protected-resource/financial/mcp the resource is
  // https://mcp.kobana.com.br/financial/mcp. If the bare metadata was
  // requested, the resource is the server origin.
  const url = new URL(req.url || '/', baseUrl);
  const wellKnownPrefix = '/.well-known/oauth-protected-resource';
  const subPath = url.pathname.slice(wellKnownPrefix.length);
  const resource = subPath ? `${baseUrl}${subPath}` : baseUrl;

  // Per-namespace scopes_supported. If the request matches a known namespace
  // (e.g. /.well-known/oauth-protected-resource/financial/mcp), return only
  // that namespace's scopes. Otherwise return the union as a fallback.
  const namespace = extractNamespaceFromResource(subPath);
  const scopesSupported = namespace
    ? getScopesForNamespace(namespace)
    : getAllScopes();

  const metadata = {
    resource,
    authorization_servers: [baseUrl],
    bearer_methods_supported: ['header'],
    scopes_supported: scopesSupported,
    resource_documentation: 'https://developers.kobana.com.br',
  };

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=3600',
  });
  res.end(JSON.stringify(metadata, null, 2));
}
