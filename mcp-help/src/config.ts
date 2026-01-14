export interface Config {
  helpCenterUrl: string;
  locale: string;
}

export function getConfig(): Config {
  return {
    helpCenterUrl: process.env.KOBANA_HELP_URL || 'https://ajuda.kobana.com.br',
    locale: process.env.KOBANA_HELP_LOCALE || 'pt-BR',
  };
}
