import { IncomingMessage, ServerResponse } from 'http';
import { getOAuthConfig } from './config.js';
import { getPendingAuth, deletePendingAuth, createAuthCode } from './sessions.js';

interface KobanaTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * Handles GET /oauth/callback
 *
 * This is the callback endpoint for Kobana OAuth. After the user authorizes
 * on Kobana, they are redirected here with an authorization code.
 *
 * Flow:
 * 1. Validate the state parameter matches a pending auth
 * 2. Exchange the Kobana code for a Kobana access token
 * 3. Generate an MCP authorization code
 * 4. Redirect to Claude's callback with the MCP code
 */
export async function handleKobanaCallback(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const params = url.searchParams;

  const kobanaCode = params.get('code');
  const kobanaState = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  // Handle error from Kobana
  if (error) {
    console.error('Kobana OAuth error:', error, errorDescription);
    sendErrorPage(res, error, errorDescription || 'Authorization failed');
    return;
  }

  // Validate state and get pending auth
  if (!kobanaState) {
    sendErrorPage(res, 'invalid_request', 'Missing state parameter');
    return;
  }

  const pendingAuth = getPendingAuth(kobanaState);
  if (!pendingAuth) {
    sendErrorPage(res, 'invalid_request', 'Invalid or expired state');
    return;
  }

  if (!kobanaCode) {
    sendErrorPage(res, 'invalid_request', 'Missing authorization code');
    return;
  }

  try {
    // Exchange Kobana code for token
    const kobanaToken = await exchangeKobanaCode(kobanaCode);

    // Clean up pending auth
    deletePendingAuth(kobanaState);

    // Create MCP authorization code linked to the Kobana token
    const mcpCode = createAuthCode(
      kobanaToken.access_token,
      pendingAuth.codeChallenge,
      pendingAuth.codeChallengeMethod,
      pendingAuth.redirectUri
    );

    // Redirect to Claude's callback with the MCP code
    const redirectUrl = new URL(pendingAuth.redirectUri);
    redirectUrl.searchParams.set('code', mcpCode);
    redirectUrl.searchParams.set('state', pendingAuth.state);

    res.writeHead(302, {
      Location: redirectUrl.toString(),
      'Cache-Control': 'no-store',
    });
    res.end();
  } catch (err) {
    console.error('Error exchanging Kobana code:', err);
    deletePendingAuth(kobanaState);
    sendErrorPage(res, 'server_error', 'Failed to complete authorization');
  }
}

async function exchangeKobanaCode(code: string): Promise<KobanaTokenResponse> {
  const config = getOAuthConfig();

  const tokenUrl = `${config.kobanaAppUrl}/oauth/token`;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${config.mcpServerUrl}/oauth/callback`,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kobana token exchange failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as KobanaTokenResponse;
}

function sendErrorPage(res: ServerResponse, error: string, description: string): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorization Error - Kobana MCP</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { color: #e53e3e; }
    p { color: #4a5568; margin: 20px 0; }
    code {
      background: #f7fafc;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>Authorization Failed</h1>
  <p>${escapeHtml(description)}</p>
  <p>Error code: <code>${escapeHtml(error)}</code></p>
  <p>Please close this window and try again.</p>
</body>
</html>
`;

  res.writeHead(400, { 'Content-Type': 'text/html' });
  res.end(html);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
