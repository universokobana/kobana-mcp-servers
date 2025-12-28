export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  kobanaAppUrl: string;
  mcpServerUrl: string;
}

export function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.KOBANA_OAUTH_CLIENT_ID;
  const clientSecret = process.env.KOBANA_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'KOBANA_OAUTH_CLIENT_ID and KOBANA_OAUTH_CLIENT_SECRET environment variables are required for OAuth'
    );
  }

  return {
    clientId,
    clientSecret,
    kobanaAppUrl: process.env.KOBANA_APP_URL || 'https://app.kobana.com.br',
    mcpServerUrl: process.env.MCP_SERVER_URL || 'https://mcp.kobana.com.br',
  };
}

export function isOAuthConfigured(): boolean {
  return !!(process.env.KOBANA_OAUTH_CLIENT_ID && process.env.KOBANA_OAUTH_CLIENT_SECRET);
}
