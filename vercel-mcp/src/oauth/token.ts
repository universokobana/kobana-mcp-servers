import { IncomingMessage, ServerResponse } from 'http';
import { getAuthCode, deleteAuthCode, createSession } from './sessions.js';
import { validatePKCE } from './pkce.js';

/**
 * Handles POST /token
 *
 * This is the OAuth 2.1 token endpoint. It exchanges an authorization code
 * for an access token.
 *
 * Required parameters (application/x-www-form-urlencoded):
 * - grant_type: must be "authorization_code"
 * - code: the authorization code from the callback
 * - code_verifier: the PKCE code verifier
 * - redirect_uri: must match the original authorization request
 */
export async function handleToken(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Only accept POST
  if (req.method !== 'POST') {
    sendError(res, 405, 'invalid_request', 'Method not allowed');
    return;
  }

  // Parse request body
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  const params = new URLSearchParams(body);

  const grantType = params.get('grant_type');
  const code = params.get('code');
  const codeVerifier = params.get('code_verifier');
  const redirectUri = params.get('redirect_uri');

  // Validate grant_type
  if (grantType !== 'authorization_code') {
    sendError(res, 400, 'unsupported_grant_type', 'Only grant_type=authorization_code is supported');
    return;
  }

  // Validate code
  if (!code) {
    sendError(res, 400, 'invalid_request', 'code is required');
    return;
  }

  // Validate code_verifier
  if (!codeVerifier) {
    sendError(res, 400, 'invalid_request', 'code_verifier is required');
    return;
  }

  // Get auth code data
  const authCode = getAuthCode(code);
  if (!authCode) {
    sendError(res, 400, 'invalid_grant', 'Invalid or expired authorization code');
    return;
  }

  // Validate redirect_uri matches
  if (redirectUri && redirectUri !== authCode.redirectUri) {
    sendError(res, 400, 'invalid_grant', 'redirect_uri mismatch');
    deleteAuthCode(code);
    return;
  }

  // Validate PKCE
  if (!validatePKCE(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
    sendError(res, 400, 'invalid_grant', 'Invalid code_verifier');
    deleteAuthCode(code);
    return;
  }

  // Delete the auth code (single use)
  deleteAuthCode(code);

  // Create MCP session with the Kobana token
  const mcpToken = createSession(authCode.kobanaToken);

  // Return the token response
  const tokenResponse = {
    access_token: mcpToken,
    token_type: 'Bearer',
    scope: 'login',
  };

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  });
  res.end(JSON.stringify(tokenResponse));
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
  res.end(
    JSON.stringify({
      error,
      error_description: description,
    })
  );
}
