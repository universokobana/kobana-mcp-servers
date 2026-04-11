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
    sendErrorPage(res, error, errorDescription || 'Autorização negada pela Kobana.');
    return;
  }

  // Validate state and get pending auth
  if (!kobanaState) {
    sendErrorPage(res, 'invalid_request', 'Parâmetro "state" ausente na resposta.');
    return;
  }

  const pendingAuth = getPendingAuth(kobanaState);
  if (!pendingAuth) {
    sendErrorPage(
      res,
      'invalid_request',
      'State inválido ou expirado. Inicie uma nova tentativa de conexão a partir do seu cliente MCP.'
    );
    return;
  }

  if (!kobanaCode) {
    sendErrorPage(res, 'invalid_request', 'Código de autorização ausente na resposta.');
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

    // Build the final client redirect URL (e.g., Claude Desktop's callback)
    // with the MCP code attached. The browser must navigate here so the MCP
    // client can exchange the code at /token. We render a brief success
    // page first so the user gets visual confirmation before being bounced.
    const redirectUrl = new URL(pendingAuth.redirectUri);
    redirectUrl.searchParams.set('code', mcpCode);
    redirectUrl.searchParams.set('state', pendingAuth.state);

    sendSuccessPage(res, redirectUrl.toString());
    return;
  } catch (err) {
    console.error('Error exchanging Kobana code:', err);
    deletePendingAuth(kobanaState);
    sendErrorPage(res, 'server_error', 'Falha ao completar a autorização com a Kobana.');
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

function sendSuccessPage(res: ServerResponse, redirectUrl: string): void {
  // Auto-redirect after a brief moment so the user sees "success" before
  // the browser bounces to the MCP client (Claude Desktop) callback.
  // We include both meta refresh (no-JS fallback) and JS redirect, plus a
  // manual link in case both are blocked.
  const safeRedirect = escapeHtml(redirectUrl);
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="2;url=${safeRedirect}">
  <title>Autenticado com sucesso — Kobana MCP</title>
  <style>
    :root { color-scheme: dark; }
    html, body { background: #0f172a; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 520px;
      margin: 0 auto;
      padding: 96px 24px 32px;
      text-align: center;
      line-height: 1.5;
      color: #ffffff;
    }
    .badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      margin-bottom: 24px;
    }
    h1 { color: #ffffff; margin: 0 0 12px; font-size: 24px; }
    p { color: #ffffff; margin: 12px 0; }
    .muted { color: #ffffff; opacity: 0.7; font-size: 13px; }
  </style>
</head>
<body>
  <div class="badge">✓</div>
  <h1>Autenticado com sucesso</h1>
  <p>Conexão com a Kobana estabelecida. Você será redirecionado de volta ao seu cliente MCP em instantes.</p>
  <p class="muted">Pode fechar esta janela depois que o cliente MCP confirmar a conexão.</p>
  <script>
    // Redirect a touch faster than the meta refresh so users with JS
    // enabled get a snappier experience.
    setTimeout(function () { window.location.replace(${JSON.stringify(redirectUrl)}); }, 1200);
  </script>
</body>
</html>
`;

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(html);
}

function sendErrorPage(res: ServerResponse, error: string, description: string): void {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Falha na autorização — Kobana MCP</title>
  <style>
    :root { color-scheme: dark; }
    html, body { background: #0f172a; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 520px;
      margin: 0 auto;
      padding: 96px 24px 32px;
      text-align: center;
      line-height: 1.5;
      color: #ffffff;
    }
    .badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      margin-bottom: 24px;
    }
    h1 { color: #ffffff; margin: 0 0 12px; font-size: 24px; }
    p { color: #ffffff; margin: 12px 0; }
    .muted { color: #ffffff; opacity: 0.7; font-size: 13px; }
    code {
      background: #1e293b;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 13px;
      font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    }
  </style>
</head>
<body>
  <div class="badge">✕</div>
  <h1>Falha na autorização</h1>
  <p>${escapeHtml(description)}</p>
  <p class="muted">Código do erro: <code>${escapeHtml(error)}</code></p>
  <p class="muted">Você pode fechar esta janela e tentar novamente a partir do seu cliente MCP.</p>
</body>
</html>
`;

  res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
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
