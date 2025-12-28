import { IncomingMessage, ServerResponse } from 'http';
import { getOAuthConfig, isOAuthConfigured } from './config.js';
import { createPendingAuth, generateState } from './sessions.js';
import { isValidCodeChallenge } from './pkce.js';

/**
 * Handles GET /authorize
 *
 * This is the OAuth 2.1 authorization endpoint. It receives the authorization
 * request from Claude and redirects to Kobana OAuth for user authentication.
 *
 * Required parameters:
 * - response_type: must be "code"
 * - client_id: the client identifier (ignored for public clients)
 * - redirect_uri: where to redirect after authorization (Claude's callback)
 * - code_challenge: PKCE code challenge
 * - code_challenge_method: must be "S256"
 * - state: client state for CSRF protection
 *
 * Optional parameters:
 * - scope: requested scopes (default: "login")
 */
export function handleAuthorize(req: IncomingMessage, res: ServerResponse): void {
  if (!isOAuthConfigured()) {
    sendError(res, 'server_error', 'OAuth not configured');
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const params = url.searchParams;

  // Validate required parameters
  const responseType = params.get('response_type');
  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const codeChallenge = params.get('code_challenge');
  const codeChallengeMethod = params.get('code_challenge_method');
  const state = params.get('state');

  // Validate response_type
  if (responseType !== 'code') {
    sendError(res, 'unsupported_response_type', 'Only response_type=code is supported');
    return;
  }

  // Validate redirect_uri
  if (!redirectUri) {
    sendError(res, 'invalid_request', 'redirect_uri is required');
    return;
  }

  // Validate redirect_uri format (must be https or localhost)
  if (!isValidRedirectUri(redirectUri)) {
    sendError(res, 'invalid_request', 'redirect_uri must be https or localhost');
    return;
  }

  // Validate PKCE (required for OAuth 2.1)
  if (!codeChallenge) {
    sendError(res, 'invalid_request', 'code_challenge is required');
    return;
  }

  if (codeChallengeMethod !== 'S256') {
    sendError(res, 'invalid_request', 'code_challenge_method must be S256');
    return;
  }

  if (!isValidCodeChallenge(codeChallenge)) {
    sendError(res, 'invalid_request', 'Invalid code_challenge format');
    return;
  }

  // Validate state
  if (!state) {
    sendError(res, 'invalid_request', 'state is required');
    return;
  }

  const config = getOAuthConfig();

  // Generate a state for the Kobana OAuth request
  const kobanaState = generateState();

  // Store pending auth with all necessary data
  createPendingAuth({
    codeChallenge,
    codeChallengeMethod,
    redirectUri,
    clientId: clientId || 'claude',
    state,
    kobanaState,
  });

  // Build Kobana OAuth URL
  const kobanaAuthUrl = new URL(`${config.kobanaAppUrl}/oauth/authorize`);
  kobanaAuthUrl.searchParams.set('client_id', config.clientId);
  kobanaAuthUrl.searchParams.set('redirect_uri', `${config.mcpServerUrl}/oauth/callback`);
  kobanaAuthUrl.searchParams.set('response_type', 'code');
  kobanaAuthUrl.searchParams.set('state', kobanaState);

  // Redirect to Kobana OAuth
  res.writeHead(302, {
    Location: kobanaAuthUrl.toString(),
    'Cache-Control': 'no-store',
  });
  res.end();
}

function isValidRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    // Allow https or localhost (for development)
    if (url.protocol === 'https:') {
      return true;
    }
    if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function sendError(res: ServerResponse, error: string, description: string): void {
  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      error,
      error_description: description,
    })
  );
}
