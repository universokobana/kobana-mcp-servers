import { getKobanaApiBaseUrl } from './oauth/config.js';

export interface Config {
  apiUrl: string;
  accessToken: string;
}

export function getConfigFromEnv(): Config {
  const accessToken = process.env.KOBANA_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('KOBANA_ACCESS_TOKEN environment variable is required');
  }

  return {
    apiUrl: getKobanaApiBaseUrl(),
    accessToken,
  };
}

export function getConfigFromHeader(authHeader: string | null, apiUrlHeader: string | null): Config | null {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return {
      apiUrl: apiUrlHeader || getKobanaApiBaseUrl(),
      accessToken: token,
    };
  }
  return null;
}

export function getConfig(authHeader: string | null, apiUrlHeader: string | null): Config {
  // Try header first, then environment
  const headerConfig = getConfigFromHeader(authHeader, apiUrlHeader);
  if (headerConfig) {
    return headerConfig;
  }
  return getConfigFromEnv();
}
