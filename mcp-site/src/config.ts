export interface Config {
  siteZipUrl: string;
  baseUrl: string;
}

export function getConfig(): Config {
  return {
    siteZipUrl: process.env.KOBANA_SITE_ZIP_URL || 'https://www.kobana.com.br/kobana-site-markdown.zip',
    baseUrl: process.env.KOBANA_SITE_BASE_URL || 'https://www.kobana.com.br',
  };
}
