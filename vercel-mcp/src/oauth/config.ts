// Default Kobana base URLs. Override with KOBANA_API_BASE_URL /
// KOBANA_APP_BASE_URL to point at sandbox or any other environment.
export const DEFAULT_KOBANA_API_BASE_URL = 'https://api.kobana.com.br';
export const DEFAULT_KOBANA_APP_BASE_URL = 'https://app.kobana.com.br';

export function getKobanaApiBaseUrl(): string {
  return process.env.KOBANA_API_BASE_URL || DEFAULT_KOBANA_API_BASE_URL;
}

export function getKobanaAppBaseUrl(): string {
  return process.env.KOBANA_APP_BASE_URL || DEFAULT_KOBANA_APP_BASE_URL;
}

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
    kobanaAppUrl: getKobanaAppBaseUrl(),
    mcpServerUrl: process.env.MCP_SERVER_URL || 'https://mcp.kobana.com.br',
  };
}

export function isOAuthConfigured(): boolean {
  return !!(process.env.KOBANA_OAUTH_CLIENT_ID && process.env.KOBANA_OAUTH_CLIENT_SECRET);
}
