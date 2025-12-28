import { IncomingMessage, ServerResponse } from 'http';
import { getOAuthConfig, isOAuthConfigured } from './config.js';

/**
 * Handles GET /.well-known/oauth-authorization-server
 *
 * Returns OAuth 2.0 Authorization Server Metadata (RFC 8414)
 * This allows clients to discover authorization endpoints.
 */
export function handleMetadata(_req: IncomingMessage, res: ServerResponse): void {
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
    scopes_supported: ['login'],
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
