import { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { isOAuthConfigured } from './config.js';

interface RegistrationRequest {
  redirect_uris?: string[];
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  scope?: string;
  contacts?: string[];
  tos_uri?: string;
  policy_uri?: string;
  jwks_uri?: string;
  software_id?: string;
  software_version?: string;
  token_endpoint_auth_method?: string;
  grant_types?: string[];
  response_types?: string[];
}

interface RegisteredClient {
  client_id: string;
  client_id_issued_at: number;
  redirect_uris: string[];
  client_name?: string;
  token_endpoint_auth_method: string;
  grant_types: string[];
  response_types: string[];
  scope: string;
}

// In-memory registry. The MCP server delegates the actual user auth to the
// upstream Kobana confidential client (configured via env vars), so the
// per-client registration here is informational only — clients are accepted
// without secrets and identified by an opaque client_id.
const registeredClients = new Map<string, RegisteredClient>();

export function getRegisteredClient(clientId: string): RegisteredClient | undefined {
  return registeredClients.get(clientId);
}

/**
 * Handles POST /register
 *
 * OAuth 2.0 Dynamic Client Registration (RFC 7591). Lets MCP clients
 * register themselves automatically so users do not have to paste a
 * Client ID/Secret into the Custom Connector dialog.
 *
 * We accept any registration request that supplies at least one
 * redirect_uri, issue an opaque client_id, and persist the metadata in
 * memory. The upstream Kobana OAuth credentials remain server-side.
 */
export async function handleRegister(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (!isOAuthConfigured()) {
    sendError(res, 404, 'invalid_request', 'OAuth not configured');
    return;
  }

  if (req.method !== 'POST') {
    sendError(res, 405, 'invalid_request', 'Method not allowed');
    return;
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  let payload: RegistrationRequest;
  try {
    payload = body ? (JSON.parse(body) as RegistrationRequest) : {};
  } catch {
    sendError(res, 400, 'invalid_client_metadata', 'Request body must be valid JSON');
    return;
  }

  const redirectUris = Array.isArray(payload.redirect_uris) ? payload.redirect_uris : [];
  if (redirectUris.length === 0) {
    sendError(res, 400, 'invalid_redirect_uri', 'At least one redirect_uri is required');
    return;
  }

  for (const uri of redirectUris) {
    if (!isValidRedirectUri(uri)) {
      sendError(res, 400, 'invalid_redirect_uri', `Invalid redirect_uri: ${uri}`);
      return;
    }
  }

  const tokenEndpointAuthMethod = payload.token_endpoint_auth_method || 'none';
  if (tokenEndpointAuthMethod !== 'none') {
    sendError(
      res,
      400,
      'invalid_client_metadata',
      'Only token_endpoint_auth_method=none is supported (PKCE-secured public clients)'
    );
    return;
  }

  const grantTypes = payload.grant_types || ['authorization_code'];
  if (!grantTypes.includes('authorization_code')) {
    sendError(res, 400, 'invalid_client_metadata', 'grant_types must include authorization_code');
    return;
  }

  const responseTypes = payload.response_types || ['code'];
  if (!responseTypes.includes('code')) {
    sendError(res, 400, 'invalid_client_metadata', 'response_types must include code');
    return;
  }

  const clientId = `mcp-client-${randomUUID()}`;
  const client: RegisteredClient = {
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: redirectUris,
    client_name: payload.client_name,
    token_endpoint_auth_method: tokenEndpointAuthMethod,
    grant_types: grantTypes,
    response_types: responseTypes,
    scope: payload.scope || 'login',
  };

  registeredClients.set(clientId, client);

  res.writeHead(201, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  });
  res.end(JSON.stringify(client));
}

function isValidRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    if (url.protocol === 'https:') return true;
    if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      return true;
    }
    // Allow custom schemes (e.g., claude://) used by native desktop clients.
    if (url.protocol && url.protocol !== 'http:' && url.protocol !== 'https:') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function sendError(
  res: ServerResponse,
  statusCode: number,
  error: string,
  description: string
): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  });
  res.end(JSON.stringify({ error, error_description: description }));
}
