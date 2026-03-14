export interface Config {
  apiUrl: string;
  accessToken: string;
}

export function getConfig(): Config {
  const accessToken = process.env.KOBANA_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('KOBANA_ACCESS_TOKEN environment variable is required');
  }

  return {
    apiUrl: process.env.KOBANA_API_URL || 'https://api.kobana.com.br',
    accessToken,
  };
}

export function getConfigSafe(): Config | null {
  try {
    return getConfig();
  } catch {
    return null;
  }
}
